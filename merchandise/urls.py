from django.urls import path
from . import views

app_name = "merchandise"

urlpatterns = [
    path("", views.home, name="home"),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path("products/", views.products, name="products"),
    path("cart/", views.cart, name="cart"),
    path("checkout/", views.checkout, name="checkout"),
    path("thank/", views.thank, name="thank"),
]
