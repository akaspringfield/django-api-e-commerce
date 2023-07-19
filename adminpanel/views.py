import json
from secrets import token_hex

from django.conf import settings
from rest_framework.exceptions import PermissionDenied
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from items.models import Items
from order.models import Order
from .models import Feedback
from .serializers import AdminItemSerializer, AdminOrderSerializer, FeedbackSerializer

ADMIN_TOKENS = set()


class AdminRequiredMixin:
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        token = request.headers.get('Authorization')
        if not token or token not in ADMIN_TOKENS:
            raise PermissionDenied('Admin login required.')


class AdminLogin(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if username != settings.ADMIN_USERNAME or password != settings.ADMIN_PASSWORD:
            raise serializers.ValidationError({'error': 'Invalid admin credentials.'})

        token = token_hex(30)
        ADMIN_TOKENS.add(token)
        return Response({'token': token, 'username': username})


class AdminItemListCreate(AdminRequiredMixin, generics.ListCreateAPIView):
    queryset = Items.objects.order_by('-created_at')
    serializer_class = AdminItemSerializer


class AdminOrderList(AdminRequiredMixin, generics.ListAPIView):
    queryset = Order.objects.order_by('-created_at')
    serializer_class = AdminOrderSerializer


class FeedbackListCreate(generics.ListCreateAPIView):
    queryset = Feedback.objects.order_by('-created_at')
    serializer_class = FeedbackSerializer

    def list(self, request, *args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or token not in ADMIN_TOKENS:
            return Response({'error': 'Admin login required.'}, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)


class AdminBill(AdminRequiredMixin, APIView):
    def get(self, request, pk):
        order = Order.objects.get(pk=pk)
        try:
            items = json.loads(order.items_snapshot or '[]')
        except json.JSONDecodeError:
            items = []

        return Response({
            'bill_number': f'BILL-{order.id:05d}',
            'order_id': order.id,
            'customer': order.full_name,
            'address': ', '.join(filter(None, [
                order.address_line1,
                order.address_line2,
                order.city,
                order.state,
                order.postal_code,
                order.country,
            ])),
            'telephone': order.telephone,
            'items': items,
            'total_price': str(order.total_price),
            'status': order.status,
            'created_at': order.created_at,
        })
