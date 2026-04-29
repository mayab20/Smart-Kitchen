import re

from rest_framework import serializers
from .models import Recipe, RecipeIngredient
from pantries.models import Pantry

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')
    ingredient_unit = serializers.ReadOnlyField(source='ingredient.get_unit_display')
    has_pantry = serializers.SerializerMethodField()
    pantry_quantity = serializers.SerializerMethodField()

    class Meta:
        model = RecipeIngredient
        fields = ['id', 'ingredient', 'ingredient_name', 'quantity', 'unit', 'ingredient_unit', 'has_pantry', 'pantry_quantity']

    def get_has_pantry(self, obj):
        pantry = self._get_pantry_entry(obj)
        if pantry is None:
            return False
        required = self._parse_quantity(obj.quantity)
        return pantry.quantity >= required if required > 0 else True

    def get_pantry_quantity(self, obj):
        pantry = self._get_pantry_entry(obj)
        return pantry.quantity if pantry else 0

    def _get_pantry_entry(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return None
        filters = {
            'user': user,
            'item': obj.ingredient,
        }
        if obj.unit:
            filters['unit__iexact'] = obj.unit
        return Pantry.objects.filter(**filters).first()

    def _parse_quantity(self, value):
        if value is None:
            return 0
        text = str(value).strip()
        match = re.match(r'^([0-9]+(?:[\.,][0-9]+)?)', text)
        if not match:
            return 0
        return float(match.group(1).replace(',', '.'))

class RecipeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True, required=False, allow_null=True)
    pdf_file = serializers.FileField(use_url=True, required=False, allow_null=True)
    ingredients = serializers.StringRelatedField(many=True, read_only=True)
    recipe_ingredients = RecipeIngredientSerializer(
        source='recipeingredient_set',
        many=True,
        read_only=True
    )

    class Meta:
        model = Recipe
        fields = '__all__'