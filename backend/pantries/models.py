from django.db import models
from items.models import Item
from django.contrib.auth.models import User


class Pantry(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="pantry_items"
    )

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name="pantry_entries"
    )

    quantity = models.FloatField()

    unit = models.CharField(
        max_length=10,
        choices=Item.Unit.choices,
        default=Item.Unit.NONE
    )

    expiration_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.item.name} ({self.quantity} {self.unit})"