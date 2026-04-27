from rest_framework import generics
from .serializers import UserSerializer, EmailUpdateSerializer,PasswordUpdateSerializer
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

class ProfileUpdateView(generics.UpdateAPIView):
  serializer_class=UserSerializer
  permission_classes= [IsAuthenticated]

  def get_object(self):
    return self.request.user
  
class EmailUpdateView(generics.UpdateAPIView):
  serializer_class=EmailUpdateSerializer
  permission_classes= [IsAuthenticated]

  def get_object(self):
    return self.request.user
  
class PasswordUpdateView(generics.UpdateAPIView):
  serializer_class=PasswordUpdateSerializer
  permission_classes= [IsAuthenticated]

  def get_object(self):
    return self.request.user
