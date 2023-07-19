from django.urls import path
from . import views

urlpatterns = [
    path('cart/', views.CartList.as_view(), name="cart_list"),
    path('cart/add/', views.CartAdd.as_view(), name='cart_add'),
    path('cart/update/<int:pk>/', views.CartUpdate.as_view(), name='cart_update'),
    path('cart/delete/<int:pk>/', views.CartDelete.as_view(), name='cart_delete'),

]
