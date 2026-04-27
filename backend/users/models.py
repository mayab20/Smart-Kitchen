from django.db import models
from django.contrib.auth.models import User
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


#profile model
class Profile(models.Model):

    class Sex(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'

    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        USER = 'USER', 'User'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    birthdate = models.DateField()

    sex = models.CharField(
        max_length=10,
        choices=Sex.choices
    )

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER
    )

    allergies = models.ManyToManyField(
        Allergy,
        blank=True,
        related_name="profiles"
    )

    dietary_preferences = models.ManyToManyField(
        DietaryPreference,
        blank=True,
        related_name="profiles"
    )

    favorite_cuisines = models.ManyToManyField(
        Cuisine,
        blank=True,
        related_name="profiles"
    )

    disliked_ingredients = models.ManyToManyField(
        Item,
        blank=True,
        related_name="profiles_who_dislike"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username