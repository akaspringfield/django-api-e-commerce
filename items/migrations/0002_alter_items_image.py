# Generated for admin product creation without mandatory image upload.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='items',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='media/images/', verbose_name='Image'),
        ),
    ]
