from django.db import models
from items.models import Item
from users.models import User

#pantry model
class Pantry(models.Model):
  user= models.ForeignKey(User, on_delete=models.cASCADE)
  items=models.ForeignKey(Item, on_delete=models.CASCADE)
  quantity=models.FloatField()
  unit=models.CharField(choices=Item.Unit.choices)
  expiration_date=models.DateField()

  def __str__(self):
     return self.name
