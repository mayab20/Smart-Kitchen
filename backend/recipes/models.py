import base64
from django.db import models
from django.contrib.auth.models import User
from items.models import Item


class Recipe(models.Model):
    class Category(models.TextChoices):
        BREAKFAST = 'BREAKFAST', 'Breakfast'
        LUNCH = 'LUNCH', 'Lunch'
        DINNER = 'DINNER', 'Dinner'
        SNACK = 'SNACK', 'Snack'
        DESSERT = 'DESSERT', 'Dessert'
        APPETIZER = 'APPETIZER', 'Appetizer'
        SIDE_DISH = 'SIDE_DISH', 'Side Dish'
        SOUP = 'SOUP', 'Soup'
        SALAD = 'SALAD', 'Salad'
        BEVERAGE = 'BEVERAGE', 'Beverage'

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.BREAKFAST
    )
    instructions = models.TextField()
    servings = models.PositiveIntegerField(default=1)
    image_name = models.CharField(max_length=255, blank=True, null=True)
    image_content_type = models.CharField(max_length=100, blank=True, null=True)
    image_data = models.BinaryField(blank=True, null=True)
    pdf_name = models.CharField(max_length=255, blank=True, null=True)
    pdf_content_type = models.CharField(max_length=100, blank=True, null=True)
    pdf_data = models.BinaryField(blank=True, null=True)
    created_at = models.DateField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)

    ingredients = models.ManyToManyField(
        Item,
        through='RecipeIngredient'
    )

    @property
    def image(self):
        if not self.image_data or not self.image_content_type:
            return None
        data = self.image_data
        if isinstance(data, memoryview):
            data = data.tobytes()
        encoded = base64.b64encode(data).decode('ascii')
        return f'data:{self.image_content_type};base64,{encoded}'

    def set_image(self, file_info):
        if not file_info:
            self.image_name = None
            self.image_content_type = None
            self.image_data = None
            return
        self.image_name = file_info.get('name')
        self.image_content_type = file_info.get('content_type')
        self.image_data = file_info.get('data')

    @property
    def pdf_file(self):
        if not self.pdf_data or not self.pdf_content_type:
            return None
        data = self.pdf_data
        if isinstance(data, memoryview):
            data = data.tobytes()
        encoded = base64.b64encode(data).decode('ascii')
        return f'data:{self.pdf_content_type};base64,{encoded}'

    def set_pdf_file(self, file_info):
        if not file_info:
            self.pdf_name = None
            self.pdf_content_type = None
            self.pdf_data = None
            return
        self.pdf_name = file_info.get('name')
        self.pdf_content_type = file_info.get('content_type')
        self.pdf_data = file_info.get('data')

    def __str__(self):
        return self.title


class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.CharField(max_length=50, blank=False)
    unit = models.CharField(max_length=20, blank=True, default='')