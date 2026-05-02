from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import QuerySet, Q
from .models import Pantry
from .serializers import PantrySerializer


class PantryViewSet(viewsets.ModelViewSet):
    serializer_class = PantrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[Pantry]:
        qs = Pantry.objects.filter(user=self.request.user).select_related('item')

        # Filter by item category
        category = self.request.query_params.get('category')
        if category:
            # allow either exact choice code or case-insensitive contains on name
            qs = qs.filter(Q(item__category__iexact=category) | Q(item__name__icontains=category))

        # Filter by expiration date range
        expires_before = self.request.query_params.get('expires_before')
        expires_after = self.request.query_params.get('expires_after')
        if expires_before:
            qs = qs.filter(expiration_date__lte=expires_before)
        if expires_after:
            qs = qs.filter(expiration_date__gte=expires_after)

        # Order by nearest expiration date first
        return qs.order_by('expiration_date')

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
