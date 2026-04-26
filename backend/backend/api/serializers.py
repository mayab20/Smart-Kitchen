from rest_framework import serializers
from .models import Item,User,Pantry

class ItemSerializer(serializers.ModelSerializer):
  class Meta:
    model=Item
    fields='__all__'

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model=User
    fields='__all__'

class PantrySerializer(serializers.ModelSerializer):
  item=ItemSerializer()
  user=UserSerializer()
  class Meta:
    model=Pantry
    fields='__all__'