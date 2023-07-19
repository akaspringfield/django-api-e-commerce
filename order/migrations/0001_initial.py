# Generated for PostgreSQL e-commerce checkout support.

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=11, verbose_name='Total Price')),
                ('full_name', models.CharField(max_length=100, verbose_name='Full Name')),
                ('address_line1', models.CharField(max_length=200, verbose_name='Address Line 1')),
                ('address_line2', models.CharField(blank=True, max_length=200, null=True, verbose_name='Address Line 2')),
                ('city', models.CharField(max_length=100, verbose_name='City')),
                ('state', models.CharField(max_length=100, verbose_name='State')),
                ('postal_code', models.CharField(max_length=30, verbose_name='Postal Code')),
                ('country', models.CharField(max_length=100, verbose_name='Country')),
                ('telephone', models.CharField(max_length=30, verbose_name='Telephone')),
                ('items_snapshot', models.TextField(blank=True, null=True, verbose_name='Items Snapshot')),
                ('status', models.CharField(choices=[('placed', 'Placed'), ('processing', 'Processing'), ('shipped', 'Shipped'), ('delivered', 'Delivered'), ('cancelled', 'Cancelled')], default='placed', max_length=20, verbose_name='Status')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('user', models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name='orders', to='user.user')),
            ],
            options={
                'db_table': 'orders',
                'ordering': ['-created_at'],
            },
        ),
    ]
