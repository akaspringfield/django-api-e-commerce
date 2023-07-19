# Create your views here.

from rest_framework import generics

from .serializers import CartListSerializer
from .models import Cart
from user.mixinx import CustomLoginRequiredMixin

class CartList(CustomLoginRequiredMixin, generics.ListAPIView):
    #hear we geting the user model as object
    queryset = Cart.objects.all()
    serializer_class = CartListSerializer

    #get request
    def get(self, request, *args, **kwargs):
        self.queryset = Cart.objects.order_by('-created_at').filter(user=request.login_user)
        return self.list(request, *args, **kwargs)


class CartAdd(CustomLoginRequiredMixin, generics.CreateAPIView):
    #hear we geting the user model as object
    queryset = Cart.objects.all()
    serializer_class = CartListSerializer

    def perform_create(self, serializer):
        existing = Cart.objects.filter(user=self.request.login_user, item=serializer.validated_data['item']).first()
        if existing:
            existing.quantity += serializer.validated_data['quantity']
            existing.save()
            serializer.instance = existing
            return

        serializer.save(user=self.request.login_user)


class CartUpdate(CustomLoginRequiredMixin, generics.UpdateAPIView):
    serializer_class = CartListSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.login_user)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class CartDelete(CustomLoginRequiredMixin, generics.DestroyAPIView):
    serializer_class = CartListSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.login_user)
