from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Profile
from .serializers import ProfileSerializer, EmailUpdateSerializer, PasswordUpdateSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        User.objects.create_user(username=username, password=password)
        return Response({'message': 'User created successfully.'}, status=status.HTTP_201_CREATED)


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