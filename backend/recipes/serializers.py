import base64
import re

from django.core.files.uploadedfile import UploadedFile
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Recipe, RecipeIngredient
from pantries.models import Pantry

class Base64FileField(serializers.Field):
    default_error_messages = {
        'invalid': 'Invalid file upload. Expected a file object or an empty value.'
    }

    def to_internal_value(self, data):
        if data is None or data == '':
            return None
        if isinstance(data, UploadedFile):
            content = data.read()
            return {
                'name': data.name,
                'content_type': data.content_type or 'application/octet-stream',
                'data': content
            }
        raise ValidationError(self.error_messages['invalid'])

    def to_representation(self, value):
        if not value:
            return None
        if isinstance(value, str):
            return value
        if isinstance(value, dict):
            content = value.get('data')
            content_type = value.get('content_type')
            if not content or not content_type:
                return None
            if isinstance(content, memoryview):
                content = content.tobytes()
            encoded = base64.b64encode(content).decode('ascii')
            return f'data:{content_type};base64,{encoded}'
        return None

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
    image = Base64FileField(required=False, allow_null=True)
    pdf_file = Base64FileField(required=False, allow_null=True)

    ingredients = serializers.StringRelatedField(many=True, read_only=True)
    recipe_ingredients = RecipeIngredientSerializer(
        source='recipeingredient_set',
        many=True,
        read_only=True
    )

    class Meta:
        model = Recipe
        fields = '__all__'
        read_only_fields = ['created_by']

    def create(self, validated_data):
        image_info = validated_data.pop('image', None)
        pdf_info = validated_data.pop('pdf_file', None)

        recipe = Recipe.objects.create(**validated_data)

        if image_info is not None:
            recipe.set_image(image_info)

        if pdf_info is not None:
            recipe.set_pdf_file(pdf_info)

        recipe.save()
        return recipe

    def update(self, instance, validated_data):
        image_info = validated_data.pop('image', serializers.empty)
        pdf_info = validated_data.pop('pdf_file', serializers.empty)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if image_info is not serializers.empty:
            instance.set_image(image_info)

        if pdf_info is not serializers.empty:
            instance.set_pdf_file(pdf_info)

        instance.save()
        return instance