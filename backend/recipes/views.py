import json

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Recipe, RecipeIngredient
from .serializers import RecipeSerializer

class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
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