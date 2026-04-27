from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Pantry
from .serializers import PantrySerializer


class PantryViewSet(viewsets.ModelViewSet):
    serializer_class = PantrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # each user sees only their own pantry
        return Pantry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)