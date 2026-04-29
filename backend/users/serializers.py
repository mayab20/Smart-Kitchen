from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):

  class Meta:
    model = Profile
    fields = [
      "id",
      "user",
      "birthdate",
      "sex",
      "role",
      "created_at",
      "updated_at",
    ]
    read_only_fields = ["created_at", "updated_at", "role"]


class RegisterSerializer(serializers.ModelSerializer):
  password = serializers.CharField(write_only=True)
  password2 = serializers.CharField(write_only=True)

  class Meta:
    model = User
    fields = ["username", "email", "password", "password2"]

  def validate_email(self, value):
    if User.objects.filter(email=value).exists():
      raise serializers.ValidationError("This email is already in use.")
    return value

  def validate(self, attrs):
    if attrs["password"] != attrs["password2"]:
      raise serializers.ValidationError({"password": "Passwords must match."})
    return attrs

  def create(self, validated_data):
    validated_data.pop("password2", None)
    password = validated_data.pop("password")
    user = User.objects.create_user(**validated_data)
    user.set_password(password)
    user.save()
    return user

  
class EmailUpdateSerializer(serializers.ModelSerializer):
  email = serializers.EmailField()

  class Meta:
    model = User
    fields = ["email"]

  def validate_email(self, value):
    if User.objects.filter(email=value).exists():
      raise serializers.ValidationError("This email is already in use.")
    return value
  
class PasswordUpdateSerializer(serializers.Serializer):
  old_password = serializers.CharField(write_only=True)
  new_password = serializers.CharField(write_only=True)

  def validate_old_password(self, value):
    user = self.context["request"].user

    if not user.check_password(value):
      raise serializers.ValidationError("Old password is incorrect.")

    return value

  def save(self, **kwargs):
    user = self.context["request"].user
    user.set_password(self.validated_data["new_password"])
    user.save()
    return user