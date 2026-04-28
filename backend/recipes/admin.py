from django.contrib import admin
from .models import Recipe, RecipeIngredient


class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 1  # Number of empty forms to display


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    inlines = [RecipeIngredientInline]
    fields = ('title', 'description', 'category', 'servings', 'instructions', 'image', 'pdf_file', 'created_by')


# Register your models here.
admin.site.register(RecipeIngredient)

