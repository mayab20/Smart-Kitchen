from rest_framework import viewsets
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Profile
from .serializers import ProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
<<<<<<< HEAD
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
=======
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
>>>>>>> b79390174dfbcc4df893cab4adaee3677bbebf74
from django.contrib.auth.models import User
from .serializers import EmailUpdateSerializer
from .serializers import PasswordUpdateSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user is None:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        response = Response({'access': access}, status=status.HTTP_200_OK)
        response.set_cookie(
            key='refresh',
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite='Lax',
        )
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({'message': 'Logged out.'}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh')
        return response


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