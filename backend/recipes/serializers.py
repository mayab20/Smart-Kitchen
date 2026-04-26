from rest_framework import serializers
from .models import Recipe, RecipeIngredient

class RecipeIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = '__all__'

class RecipeSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(
        source='recipeingredient_set',
        many=True
    )

    class Meta:
        model = Recipe
        fields = '__all__'