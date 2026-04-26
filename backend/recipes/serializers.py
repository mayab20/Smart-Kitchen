from rest_framework import serializers
from .models import Recipe, RecipeIngredient

class RecipeIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = '__all__'

class RecipeSerializer(serializers.ModelSerializer):
    recipe_ingredients = serializers.PrimaryKeyRelatedField(
        source='recipeingredient_set',
        many=True,
        read_only=True
    )

    class Meta:
        model = Recipe
        fields = '__all__'
        extra_kwargs = { 'ingredients': { 'required': False } }