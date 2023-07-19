from django.urls import path

from . import views

urlpatterns = [
    path('login/', views.AdminLogin.as_view(), name='admin_login'),
    path('items/', views.AdminItemListCreate.as_view(), name='admin_items'),
    path('orders/', views.AdminOrderList.as_view(), name='admin_orders'),
    path('orders/<int:pk>/bill/', views.AdminBill.as_view(), name='admin_bill'),
    path('feedback/', views.FeedbackListCreate.as_view(), name='feedback'),
]
