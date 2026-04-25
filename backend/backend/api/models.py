from django.db import models

#items model
class Item(models.Model):

  class Category(models.TextChoices):
    VEGETABLES = 'VEGETABLES', 'Vegetables'
    FRUITS = 'FRUITS', 'Fruits'
    MEAT = 'MEAT', 'Meat'
    POULTRY = 'POULTRY', 'Poultry'
    SEAFOOD = 'SEAFOOD', 'Seafood'
    DAIRY = 'DAIRY', 'Dairy'
    EGGS = 'EGGS', 'Eggs'
    BAKERY = 'BAKERY', 'Bakery'
    GRAINS = 'GRAINS', 'Grains'
    PASTA = 'PASTA', 'Pasta'
    RICE = 'RICE', 'Rice'
    CANNED = 'CANNED', 'Canned'
    FROZEN = 'FROZEN', 'Frozen'
    SNACKS = 'SNACKS', 'Snacks'
    SWEETS = 'SWEETS', 'Sweets'
    SPICES = 'SPICES', 'Spices'
    SEASONING = 'SEASONING', 'Seasoning'
    OILS = 'OILS', 'Oils'
    CONDIMENTS = 'CONDIMENTS', 'Condiments'
    SAUCES = 'SAUCES', 'Sauces'
    BEVERAGES = 'BEVERAGES', 'Beverages'
    TEA_COFFEE = 'TEA_COFFEE', 'Tea & Coffee'
    NUTS_SEEDS = 'NUTS_SEEDS', 'Nuts & Seeds'
    LEGUMES = 'LEGUMES', 'Legumes'
    BREAKFAST = 'BREAKFAST', 'Breakfast'
    BAKING = 'BAKING', 'Baking'
    BABY_FOOD = 'BABY_FOOD', 'Baby Food'
    OTHER = 'OTHER', 'Other'

  class Unit(models.TextChoices):
    PCS = 'PCS', 'Pieces'
    PACK = 'PACK', 'Pack'
    BOX = 'BOX', 'Box'
    BAG = 'BAG', 'Bag'
    BOTTLE = 'BOTTLE', 'Bottle'
    CAN = 'CAN', 'Can'
    JAR = 'JAR', 'Jar'
    G = 'G', 'Grams'
    KG = 'KG', 'Kilograms'
    ML = 'ML', 'Milliliters'
    L = 'L', 'Liters'
    TSP = 'TSP', 'Teaspoon'
    TBSP = 'TBSP', 'Tablespoon'
    CUP = 'CUP', 'Cup'
    CUPS = 'CUPS', 'Cups'
    SLICE = 'SLICE', 'Slice'
    SLICES = 'SLICES', 'Slices'
    LEAVES = 'LEAVES', 'Leaves'
    CLOVE = 'CLOVE', 'Clove'
    CLOVES = 'CLOVES', 'Cloves'
    PINCH = 'PINCH', 'Pinch'
    NONE = 'NONE', 'No unit'

  name=models.CharField(max_length=100)
  category=Category.choices
  units=Unit.choices

  def __str__(self):
    return self.name