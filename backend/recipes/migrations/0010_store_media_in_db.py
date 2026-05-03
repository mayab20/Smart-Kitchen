import os
import mimetypes

from django.conf import settings
from django.db import migrations, models


def migrate_files_to_db(apps, schema_editor):
    Recipe = apps.get_model('recipes', 'Recipe')

    for recipe in Recipe.objects.all():
        changed = False

        if getattr(recipe, 'image', None):
            image_file = recipe.image
            if hasattr(image_file, 'path') and os.path.exists(image_file.path):
                with open(image_file.path, 'rb') as fp:
                    recipe.image_data = fp.read()
                    recipe.image_name = os.path.basename(image_file.name)
                    recipe.image_content_type = mimetypes.guess_type(image_file.name)[0] or 'application/octet-stream'
                    changed = True

        if getattr(recipe, 'pdf_file', None):
            pdf_file = recipe.pdf_file
            if hasattr(pdf_file, 'path') and os.path.exists(pdf_file.path):
                with open(pdf_file.path, 'rb') as fp:
                    recipe.pdf_data = fp.read()
                    recipe.pdf_name = os.path.basename(pdf_file.name)
                    recipe.pdf_content_type = mimetypes.guess_type(pdf_file.name)[0] or 'application/octet-stream'
                    changed = True

        if changed:
            recipe.save()


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0009_recipeingredient_unit'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipe',
            name='image_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='recipe',
            name='image_content_type',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='recipe',
            name='image_data',
            field=models.BinaryField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='recipe',
            name='pdf_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='recipe',
            name='pdf_content_type',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='recipe',
            name='pdf_data',
            field=models.BinaryField(blank=True, null=True),
        ),
        migrations.RunPython(migrate_files_to_db, reverse_code=migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='recipe',
            name='image',
        ),
        migrations.RemoveField(
            model_name='recipe',
            name='pdf_file',
        ),
    ]
