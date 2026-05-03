from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0010_store_media_in_db'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recipe',
            name='category',
            field=models.CharField(
                choices=[
                    ('BREAKFAST', 'Breakfast'),
                    ('LUNCH', 'Lunch'),
                    ('DINNER', 'Dinner'),
                    ('SNACK', 'Snack'),
                    ('DESSERT', 'Dessert'),
                    ('APPETIZER', 'Appetizer'),
                    ('SIDE_DISH', 'Side Dish'),
                    ('SOUP', 'Soup'),
                    ('SALAD', 'Salad'),
                    ('BEVERAGE', 'Beverage'),
                ],
                default='BREAKFAST',
                max_length=20,
            ),
        ),
    ]
