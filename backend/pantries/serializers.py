from rest_framework import serializers
from .models import Pantry

class PantrySerializer(serializers.ModelSerializer):
  class Meta:
    model = Pantry
    fields = "__all__"
    read_only_fields = ["user", "created_at", "updated_at"]

  def create(self, validated_data):
    request = self.context["request"]
    return Pantry.objects.create(user=request.user, **validated_data)

