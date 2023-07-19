from rest_framework import serializers

from items.models import Items
from order.models import Order
from .models import Feedback


class AdminItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Items
        fields = ('id', 'status', 'name', 'description', 'price', 'image', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class AdminOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ('id', 'name', 'email', 'message', 'created_at')
        read_only_fields = ('id', 'created_at')
