from .models import Cart
from rest_framework import serializers
#from django.contrib.auth.hashers import make_password, check_password
#from secrets import token_hex
#import datetime

class CartListSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_price = serializers.DecimalField(source='item.price', max_digits=11, decimal_places=2, read_only=True)
    item_image = serializers.ImageField(source='item.image', read_only=True)

    class Meta:
        model = Cart
        fields = ('id', 'user', 'item', 'item_name', 'item_price', 'item_image', 'quantity', 'created_at', 'updated_at')
        read_only_fields = ('user', 'created_at', 'updated_at')
