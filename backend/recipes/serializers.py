from rest_framework import serializers
from .models import Recipe, RecipeIngredient

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')
    ingredient_unit = serializers.ReadOnlyField(source='ingredient.get_unit_display')

    class Meta:
        model = RecipeIngredient
        fields = ['id', 'ingredient', 'ingredient_name', 'quantity', 'unit', 'ingredient_unit']

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