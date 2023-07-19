from django.urls import path

from . import views

urlpatterns = [
    path('orders/', views.OrderList.as_view(), name='order_list'),
    path('orders/add/', views.OrderAdd.as_view(), name='order_add'),
]
