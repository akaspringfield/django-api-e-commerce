from django.shortcuts import render

# Create your views here.
from decimal import Decimal
import json

from rest_framework import generics, serializers

from cart.models import Cart
from user.mixinx import CustomLoginRequiredMixin
from .models import Order
from .serializers import OrderSerializer


class OrderList(CustomLoginRequiredMixin, generics.ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.login_user)


class OrderAdd(CustomLoginRequiredMixin, generics.CreateAPIView):
    serializer_class = OrderSerializer

    def perform_create(self, serializer):
        cart_rows = Cart.objects.filter(user=self.request.login_user).select_related('item')
        if not cart_rows.exists():
            raise serializers.ValidationError({'error': 'Cart is empty.'})

        total = Decimal('0.00')
        snapshot = []
        for row in cart_rows:
            line_total = row.item.price * row.quantity
            total += line_total
            snapshot.append({
                'item_id': row.item.id,
                'name': row.item.name,
                'price': str(row.item.price),
                'quantity': row.quantity,
                'line_total': str(line_total),
            })

        serializer.save(
            user=self.request.login_user,
            total_price=total,
            items_snapshot=json.dumps(snapshot),
        )
        cart_rows.delete()
