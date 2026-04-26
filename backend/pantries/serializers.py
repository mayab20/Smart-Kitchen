from rest_framework import serializers
from items.serializers import ItemSerializer
from users.serializers import UserSerializer
from pantries.models import Pantry

class PantrySerializer(serializers.ModelSerializer):
  item=ItemSerializer()
  user=UserSerializer()
  class Meta:
    model=Pantry
    fields='__all__'