import json

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .models import Recipe
from .serializers import RecipeSerializer

from .models import Recipe, RecipeIngredient
from .serializers import RecipeSerializer

class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

    def _extract_ingredients_data(self, data):
        ingredients_data = data.pop('ingredients_data', None)
        if not ingredients_data:
            return None

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

        recipe = serializer.save()
        if ingredients_data is not None:
            self._save_ingredients(recipe, ingredients_data)

        return Response(self.get_serializer(recipe).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        ingredients_data = self._extract_ingredients_data(data) if 'ingredients_data' in request.data else None

        serializer = self.get_serializer(instance, data=data, partial=partial)
        if not serializer.is_valid():
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        recipe = serializer.save()
        if ingredients_data is not None:
            self._save_ingredients(recipe, ingredients_data)

        return Response(self.get_serializer(recipe).data)
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='my-recipes')
    def my_recipes(self, request):
        recipes = Recipe.objects.filter(created_by=request.user)
        serializer = self.get_serializer(recipes, many=True)
        return Response(serializer.data)
