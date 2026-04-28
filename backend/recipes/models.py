from django.db import models
from django.contrib.auth.models import User
from items.models import Item


class Recipe(models.Model):
    class Category(models.TextChoices):
        SALAD = 'SALAD', 'Salad'
        SOUP = 'SOUP', 'Soup'
        APPETIZER = 'APPETIZER', 'Appetizer'
        MAIN = 'MAIN', 'Main Course'
        DESSERT = 'DESSERT', 'Dessert'
        DRINK = 'DRINK', 'Drink'
        OTHER = 'OTHER', 'Other'

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER
    )
    instructions = models.TextField()
    servings = models.PositiveIntegerField(default=1)
    image = models.ImageField(upload_to='recipes/images/', blank=True, null=True)
    pdf_file = models.FileField(upload_to='recipes/pdfs/', blank=True, null=True)
    created_at = models.DateField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)

    ingredients = models.ManyToManyField(
        Item,
        through='RecipeIngredient'
    )

    def __str__(self):
        return self.title


class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.CharField(max_length=50, blank=False)
    unit = models.CharField(max_length=20, blank=True, default='')