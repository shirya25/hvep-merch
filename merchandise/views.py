from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.models import User
from .models import Profile
from .forms import UserLoginForm


def home(request):
    return render(request, "merchandise/home.html")

def products(request):
    return render(request, "merchandise/products.html")

def checkout(request):
    return render(request, "merchandise/checkout.html")

def thank(request):
    return render(request, "merchandise/thanks.html")

def signup_view(request):
    if request.method == "POST":
        full_name = request.POST['fullname']
        email = request.POST['email']
        mobile = request.POST['mobile']
        password = request.POST['password']
        confirm_password = request.POST['confirmPassword']

        if password != confirm_password:
            messages.error(request, "Passwords do not match")
            return redirect('merchandise:signup')

        if User.objects.filter(username=email).exists():
            messages.error(request, "Email already registered")
            return redirect('merchandise:signup')
        user = User.objects.create_user(
            username=email, 
            email=email,
            password=password
        )

        Profile.objects.create(
            user=user,
            full_name=full_name,
            mobile=mobile
        )
        return redirect('merchandise:login')

    return render(request, 'merchandise/signup.html')


def login_view(request):
    if request.method == 'POST':
        form = UserLoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('merchandise:home') 
    else:
        form = UserLoginForm()
    
    return render(request, 'merchandise/userLogin.html', {'form': form})