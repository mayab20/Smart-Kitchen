from rest_framework import viewsets
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Profile
from .serializers import ProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from .serializers import EmailUpdateSerializer
from .serializers import PasswordUpdateSerializer


class ProfileViewSet(viewsets.ModelViewSet):
  serializer_class = ProfileSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    # user can only see their own profile
    return Profile.objects.filter(user=self.request.user)

  def perform_create(self, serializer):
    serializer.save(user=self.request.user)

class EmailUpdateView(APIView):
  permission_classes = [IsAuthenticated]

  def put(self, request):
    serializer = EmailUpdateSerializer(
      instance=request.user,
      data=request.data
    )

    if serializer.is_valid():
      serializer.save()
      return Response(
          {"message": "Email updated successfully"},
          status=status.HTTP_200_OK
      )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordUpdateView(APIView):
  permission_classes = [IsAuthenticated]

  def put(self, request):
    serializer = PasswordUpdateSerializer(
      data=request.data,
      context={"request": request}
    )

    if serializer.is_valid():
      serializer.save()
      return Response(
        {"message": "Password updated successfully"},
        status=status.HTTP_200_OK
      )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)