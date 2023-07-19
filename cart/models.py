from django.db import models
from user.models import User
from items.models import Items

# Create your models here.
class Cart(models.Model):
    class Meta(object):
        db_table = 'cart'

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, db_index=True, related_name='cart_items'
    )
    item = models.ForeignKey(
        Items, on_delete=models.CASCADE, db_index=True, related_name='cart_rows'
    )
    quantity = models.IntegerField(
        'Quantity', blank=False, null=False, db_index=True
    )
    created_at = models.DateTimeField(
        'Created At', blank=True, auto_now_add=True
    )
    updated_at = models.DateTimeField(
        'Updated At', blank=True, auto_now=True
    )
