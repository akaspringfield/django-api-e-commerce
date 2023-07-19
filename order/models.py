from django.db import models
from user.models import User

# Create your models here.
STATUS = (
    ('placed', 'Placed'),
    ('processing', 'Processing'),
    ('shipped', 'Shipped'),
    ('delivered', 'Delivered'),
    ('cancelled', 'Cancelled'),
)


class Order(models.Model):
    class Meta(object):
        db_table = 'orders'
        ordering = ['-created_at']

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, db_index=True, related_name='orders'
    )
    total_price = models.DecimalField(
        'Total Price', blank=False, null=False, max_digits=11, decimal_places=2
    )
    full_name = models.CharField(
        'Full Name', blank=False, null=False, max_length=100
    )
    address_line1 = models.CharField(
        'Address Line 1', blank=False, null=False, max_length=200
    )
    address_line2 = models.CharField(
        'Address Line 2', blank=True, null=True, max_length=200
    )
    city = models.CharField(
        'City', blank=False, null=False, max_length=100
    )
    state = models.CharField(
        'State', blank=False, null=False, max_length=100
    )
    postal_code = models.CharField(
        'Postal Code', blank=False, null=False, max_length=30
    )
    country = models.CharField(
        'Country', blank=False, null=False, max_length=100
    )
    telephone = models.CharField(
        'Telephone', blank=False, null=False, max_length=30
    )
    items_snapshot = models.TextField(
        'Items Snapshot', blank=True, null=True
    )
    status = models.CharField(
        'Status', blank=False, default='placed', max_length=20, choices=STATUS
    )
    created_at = models.DateTimeField(
        'Created At', blank=True, auto_now_add=True
    )
    updated_at = models.DateTimeField(
        'Updated At', blank=True, auto_now=True
    )
