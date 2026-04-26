from django.db import models
from items.models import Item

#Helper models 
class Allergy(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class DietaryPreference(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Cuisine(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

#user model
class User(models.Model):
  class Sex(models.TextChoices):
    MALE = 'MALE', 'Male'
    FEMALE = 'FEMALE', 'Female'

  class Role(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    USER='USER','User'

  name=models.CharField(max_length=100)
  email=models.EmailField(unique=True)  
  password=models.CharField(max_length=100)
  birthdate=models.DateField()
  sex=Sex.choices
  allergies=models.ManyToManyField(Allergy,blank=True)
  dietary_preferences=models.ManyToManyField(DietaryPreference, blank=True)
  favorite_cuisine=models.ManyToManyField(Cuisine,blank=True)
  disliked_ingredients=models.ManyToManyField(Item, blank=True)
  role=Role.choices

  def __str__(self):
    return self.name