import json
import re

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Prefetch

from pantries.models import Pantry
from .models import Recipe, RecipeIngredient
from .serializers import RecipeSerializer

class RecipeViewSet(viewsets.ModelViewSet):
    # Prefetch ingredients and their related ingredient row to avoid N+1 queries
    queryset = Recipe.objects.all().select_related('created_by').prefetch_related(
        Prefetch(
            'recipeingredient_set',
            queryset=RecipeIngredient.objects.select_related('ingredient')
        )
    )
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='my-recipes')
    def my_recipes(self, request):
        recipes = self.get_queryset().filter(created_by=request.user)
        serializer = self.get_serializer(recipes, many=True)
        return Response(serializer.data)

    def _extract_ingredients_data(self, data):
        ingredients_data = data.get('ingredients_data', None)
        if ingredients_data is None:
            return None

        if isinstance(ingredients_data, list):
            ingredients_data = ingredients_data[0]

        if isinstance(ingredients_data, bytes):
            ingredients_data = ingredients_data.decode('utf-8')

        if isinstance(ingredients_data, str):
            try:
                ingredients_data = json.loads(ingredients_data)
            except ValueError:
                return None

        return ingredients_data

    def _save_ingredients(self, recipe, ingredients_data):
        recipe.recipeingredient_set.all().delete()
        for item in ingredients_data or []:
            ingredient_id = item.get('ingredient')
            quantity = item.get('quantity', '')
            unit = item.get('unit', '')
            if ingredient_id:
                RecipeIngredient.objects.create(
                    recipe=recipe,
                    ingredient_id=ingredient_id,
                    quantity=quantity,
                    unit=unit
                )

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        ingredients_data = self._extract_ingredients_data(data)

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        recipe = serializer.save(created_by=request.user if request.user.is_authenticated else None)
        if ingredients_data is not None:
            self._save_ingredients(recipe, ingredients_data)

        return Response(self.get_serializer(recipe).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if instance.created_by_id != request.user.id:
            return Response({'detail': 'You can only edit your own recipes.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        data.pop('created_by', None)
        if data.get('image', None) == '':
            data['image'] = None
        if data.get('pdf_file', None) == '':
            data['pdf_file'] = None
        ingredients_data = self._extract_ingredients_data(data) if 'ingredients_data' in request.data else None

        serializer = self.get_serializer(instance, data=data, partial=partial)
        if not serializer.is_valid():
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        recipe = serializer.save()
        if ingredients_data is not None:
            self._save_ingredients(recipe, ingredients_data)

        return Response(self.get_serializer(recipe).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.created_by_id != request.user.id:
            return Response({'detail': 'You can only delete your own recipes.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    def _parse_quantity(self, value):
        if value is None:
            return 0
        text = str(value).strip()
        match = re.match(r'^([0-9]+(?:[\.,][0-9]+)?)', text)
        if not match:
            return 0
        return float(match.group(1).replace(',', '.'))

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='cook')
    def cook(self, request, pk=None):
        # get_object() will use the viewset queryset with prefetch to avoid extra queries
        recipe = self.get_object()
        try:
            servings = float(request.data.get('servings', recipe.servings))
        except (TypeError, ValueError):
            return Response({'detail': 'Invalid servings value'}, status=status.HTTP_400_BAD_REQUEST)

        if servings <= 0:
            return Response({'detail': 'Servings must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

        multiplier = servings / max(recipe.servings, 1)
        insufficient = []
        updates = []

        ingredients = list(recipe.recipeingredient_set.all())
        # Batch fetch pantries for all ingredient items for this user
        ingredient_items = [ing.ingredient_id for ing in ingredients]
        pantry_qs = Pantry.objects.filter(user=request.user, item_id__in=ingredient_items).select_related('item')
        # Build a lookup by (item_id, unit_lower or '')
        pantry_map = {}
        for p in pantry_qs:
            key = (p.item_id, (p.unit or '').strip().lower())
            pantry_map.setdefault(key, p)

        for ingredient in ingredients:
            required_qty = self._parse_quantity(ingredient.quantity) * multiplier
            unit_key = (ingredient.ingredient_id, (ingredient.unit or '').strip().lower())
            pantry = pantry_map.get(unit_key)
            # fallback: any pantry for the item regardless of unit
            if pantry is None:
                pantry = pantry_map.get((ingredient.ingredient_id, ''))

            available_qty = pantry.quantity if pantry else 0
            if pantry is None or available_qty < required_qty:
                insufficient.append({
                    'ingredient': ingredient.ingredient.name,
                    'required': required_qty,
                    'available': available_qty,
                    'unit': ingredient.unit or ingredient.ingredient.get_unit_display()
                })
            else:
                updates.append((pantry, required_qty))

        if insufficient:
            return Response({'detail': 'Not enough pantry stock', 'insufficient': insufficient}, status=status.HTTP_400_BAD_REQUEST)

        used = []
        for pantry, required_qty in updates:
            pantry.quantity = max(pantry.quantity - required_qty, 0)
            pantry.save()
            used.append({
                'item': pantry.item.name,
                'used': required_qty,
                'remaining': pantry.quantity,
                'unit': pantry.unit
            })

        return Response({
            'detail': 'Cooked successfully',
            'servings': servings,
            'used': used
        })
