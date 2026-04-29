from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Item
from .serializers import ItemSerializer


class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        search = self.request.query_params.get('search', '')
        if search:
            return Item.objects.filter(name__istartswith=search)
        return Item.objects.all()