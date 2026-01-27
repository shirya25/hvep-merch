from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import Profile
from .forms import UserLoginForm
from django.db import transaction
import re


def home(request):
    return render(request, "merchandise/home.html")

@login_required(login_url='merchandise:login')
def profile(request):
    # Ensure profile exists
    profile, created = Profile.objects.get_or_create(
        user=request.user,
        defaults={
            'full_name': '',
            'mobile': '',
            'gender': '',
            'address': '',
            'city': '',
            'postal_code': ''
        }
    )
    return render(request, "merchandise/profile.html")

def products(request):
    return render(request, "merchandise/products.html")

def checkout(request):
    return render(request, "merchandise/checkout.html")

def thank(request):
    return render(request, "merchandise/thanks.html")

def cart(request):
    return render(request, "merchandise/cart.html")

def signup_view(request):
    if request.method == "POST":
        full_name = request.POST.get('fullname', '').strip()
        email = request.POST.get('email', '').strip()
        country_code = request.POST.get('countryCode', '+91')
        mobile = request.POST.get('mobile', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirmPassword', '')

        # Validation
        if not all([full_name, email, mobile, password]):
            messages.error(request, "All fields are required")
            return redirect('merchandise:signup')

        if password != confirm_password:
            messages.error(request, "Passwords do not match")
            return redirect('merchandise:signup')

        if User.objects.filter(username=email).exists():
            messages.error(request, "Email already registered")
            return redirect('merchandise:signup')

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already registered")
            return redirect('merchandise:signup')

        try:
            # Use transaction to ensure both User and Profile are created together
            with transaction.atomic():
                # Create user
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password
                )

                # Split full name into first and last name
                name_parts = full_name.split(' ', 1)
                user.first_name = name_parts[0]
                user.last_name = name_parts[1] if len(name_parts) > 1 else ''
                user.save()

                # Create profile with full mobile number
                full_mobile = f"{country_code} {mobile}"
                Profile.objects.create(
                    user=user,
                    full_name=full_name,
                    mobile=full_mobile
                )

            messages.success(request, "Account created successfully!")
            return redirect('merchandise:home')

        except Exception as e:
            messages.error(request, f"Error creating account: {str(e)}")
            return redirect('merchandise:signup')

    return render(request, 'merchandise/signup.html')


def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Authenticate using email as username
        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, "Login successful!")

            # redirect to home
            return redirect('merchandise:home')
        else:
            messages.error(request, "Invalid email or password")

    return render(request, 'merchandise/userLogin.html')


@login_required(login_url='merchandise:login')
def logout_view(request):
    """Handle user logout"""
    logout(request)
    messages.success(request, "You have been logged out successfully!")
    return redirect('merchandise:home')


@login_required(login_url='merchandise:login')
def update_profile(request):
    """Handle profile updates"""
    if request.method == 'POST':
        try:
            # Get or create profile
            profile, created = Profile.objects.get_or_create(user=request.user)

            # Update all profile fields
            profile.full_name = request.POST.get('full_name', '').strip()
            profile.mobile = request.POST.get('mobile', '').strip()
            profile.gender = request.POST.get('gender', '').strip()
            profile.address = request.POST.get('address', '').strip()
            profile.city = request.POST.get('city', '').strip()
            profile.postal_code = request.POST.get('postal_code', '').strip()
            profile.save()

            # Update user's first and last name
            full_name = profile.full_name
            if full_name:
                name_parts = full_name.split(' ', 1)
                request.user.first_name = name_parts[0]
                request.user.last_name = name_parts[1] if len(name_parts) > 1 else ''
                request.user.save()

            messages.success(request, "Profile updated successfully!")
        except Exception as e:
            messages.error(request, f"Error updating profile: {str(e)}")

    return redirect('merchandise:profile')


@login_required(login_url='merchandise:login')
def change_password(request):
    """Handle password change"""
    if request.method == 'POST':
        old_password = request.POST.get('old_password', '')
        new_password1 = request.POST.get('new_password1', '')
        new_password2 = request.POST.get('new_password2', '')

        # Validate old password
        if not request.user.check_password(old_password):
            messages.error(request, "Current password is incorrect")
            return redirect('merchandise:profile')

        # Validate new passwords match
        if new_password1 != new_password2:
            messages.error(request, "New passwords do not match")
            return redirect('merchandise:profile')

        # Validate password strength
        if len(new_password1) < 8:
            messages.error(request, "Password must be at least 8 characters long")
            return redirect('merchandise:profile')

        if not re.search(r'[A-Z]', new_password1):
            messages.error(request, "Password must contain at least one uppercase letter")
            return redirect('merchandise:profile')

        if not re.search(r'[a-z]', new_password1):
            messages.error(request, "Password must contain at least one lowercase letter")
            return redirect('merchandise:profile')

        if not re.search(r'[0-9]', new_password1):
            messages.error(request, "Password must contain at least one number")
            return redirect('merchandise:profile')

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', new_password1):
            messages.error(request, "Password must contain at least one special character")
            return redirect('merchandise:profile')

        # Validate new password is different from old
        if old_password == new_password1:
            messages.error(request, "New password must be different from current password")
            return redirect('merchandise:profile')

        try:
            # Change the password
            request.user.set_password(new_password1)
            request.user.save()

            # Important: Update session to prevent logout
            update_session_auth_hash(request, request.user)

            messages.success(request, "Password changed successfully!")
        except Exception as e:
            messages.error(request, f"Error changing password: {str(e)}")

    return redirect('merchandise:profile')