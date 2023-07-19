from rest_framework import serializers

from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = (
            'id',
            'user',
            'total_price',
            'full_name',
            'address_line1',
            'address_line2',
            'city',
            'state',
            'postal_code',
            'country',
            'telephone',
            'items_snapshot',
            'status',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('user', 'total_price', 'items_snapshot', 'status', 'created_at', 'updated_at')
