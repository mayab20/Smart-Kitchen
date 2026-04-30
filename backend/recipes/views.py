import json
import re

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from pantries.models import Pantry
from .models import Recipe, RecipeIngredient
from .serializers import RecipeSerializer

class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

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
        data['created_by'] = request.user.id if request.user.is_authenticated else None
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
        data = request.data.copy()
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

        for ingredient in recipe.recipeingredient_set.all():
            required_qty = self._parse_quantity(ingredient.quantity) * multiplier
            filters = {
                'user': request.user,
                'item': ingredient.ingredient,
            }
            if ingredient.unit:
                filters['unit__iexact'] = ingredient.unit
            pantry = Pantry.objects.filter(**filters).first()
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