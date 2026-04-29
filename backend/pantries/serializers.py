from rest_framework import serializers
from .models import Pantry

class PantrySerializer(serializers.ModelSerializer):
  item_name = serializers.CharField(source='item.name', read_only=True)
  item_category = serializers.CharField(source='item.category', read_only=True)

  class Meta:
    model = Pantry
    fields = ['id', 'item', 'item_name', 'item_category', 'quantity', 'unit', 'expiration_date']

  def create(self, validated_data):
    request = self.context["request"]
    return Pantry.objects.create(**validated_data)

