from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0008_recipe_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipeingredient',
            name='unit',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
    ]
