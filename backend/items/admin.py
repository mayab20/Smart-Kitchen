from django.contrib import admin
from .models import Item
from recipes.models import RecipeIngredient


class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 0
    readonly_fields = ('recipe', 'quantity')


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    inlines = [RecipeIngredientInline]
