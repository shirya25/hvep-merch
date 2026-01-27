from django.urls import path
from . import views

app_name = 'merchandise'

urlpatterns = [
    path('', views.home, name='home'),
    path('profile/', views.profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/change-password/', views.change_password, name='change_password'),
    path('products/', views.products, name='products'),
    path('checkout/', views.checkout, name='checkout'),
    path('thanks/', views.thank, name='thanks'),
    path('cart/', views.cart, name='cart'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
]