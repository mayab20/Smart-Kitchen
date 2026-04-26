from rest_framework import generics
from .serializers import UserSerializer
from .models import User
from rest_framework.permissions import IsAuthenticated

class UserProfileView(generics.RetrieveAPIView):
  serializer_class= UserSerializer
  permission_classes =[IsAuthenticated]

  def get_object(self):
    return self.request.user

class UserCreateView(generics.CreateAPIView):
  queryset= User.objects.all()
  serializer_class= UserSerializer
  permission_classes= [IsAuthenticated]

class UserProfileUpdateView(generics.UpdateAPIView):
  serializer_class=UserSerializer
  permission_classes= [IsAuthenticated]

  def get_object(self):
    return self.request.user
  
