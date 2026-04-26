from rest_framework import viewsets
from .models import Recipe
from .serializers import RecipeSerializer
from rest_framework.response import Response
from rest_framework import status

class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print(serializer.errors)  # 👈 THIS IS IMPORTANT
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(serializer.data)