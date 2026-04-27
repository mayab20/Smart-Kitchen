from django.db import models
from django.contrib.auth.models import User


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

    birthdate = models.DateField(null=True, blank=True)

    sex = models.CharField(
        max_length=10,
        choices=Sex.choices,
        null=True,
        blank=True
    )

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return getattr(self.user, "username", "No User")