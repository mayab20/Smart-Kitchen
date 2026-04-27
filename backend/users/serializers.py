from rest_framework import serializers
from .models import User

class ProfileSerializer(serializers.ModelSerializer):
  class Meta:
    model=User
    fields=['name','favorite_cuisine','allergies','disliked_ingredients','dietary_preferences']

class EmailUpdateSerializer(serializers.ModelSerializer):
  class Meta:
    model=User
    fields=['email']
  
  def validate_email(self,value):
    if User.objects.filter(email=value).exist():
      raise serializers.ValidatorError("This email is already in use.")
    return value

class PasswordUpdateSerializer(serializers.ModelSerializer):
  old_password=serializers.CharField()
  new_password=serializers .CharField()
  
  class Meta:
    model=User
    fields=['old_password','new_password']

    def validate_old_password(self,value):
      user=self.context['request'].user
      if not user.check_password(value):
        raise serializers.ValidationError("Old password is incorrect.")
      return value

    def update(self, instance, validated_data):
      instance.set_password(validated_data['new_password'])
      instance.save()
      return instance