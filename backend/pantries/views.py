from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import QuerySet
from .models import Pantry
from .serializers import PantrySerializer


class PantryViewSet(viewsets.ModelViewSet):
    serializer_class = PantrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[Pantry]:
        return Pantry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        print("DATA:", serializer.validated_data) 
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        item = request.data.get('item')
        unit = request.data.get('unit')
        expiration_date = request.data.get('expiration_date')
        quantity = float(request.data.get('quantity', 0))

        existing = Pantry.objects.filter(
            user=request.user,
            item=item,
            unit=unit,
            expiration_date=expiration_date
        ).first()

        if existing:
            existing.quantity = float(existing.quantity) + quantity
            existing.save()
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)
