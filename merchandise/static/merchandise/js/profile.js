/**
 * Him Village Prahari - Profile Page JavaScript
 * Handles profile interactions, form validation, wishlist display, and logout functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile page loaded');
    initializeProfilePage();
});

// Initialize all profile page functionality
function initializeProfilePage() {
    setupMenuNavigation();
    setupFormValidation();
    setupPasswordValidation();
    setupAutoSaveIndicator();
    animateStatsOnScroll();

    // Initial wishlist count update
    updateWishlistCount();

    // Ensure CartManager is initialized
    if (window.CartManager && typeof window.CartManager.init === 'function') {
        window.CartManager.init();
    }
}

// Menu Navigation - Enhanced to handle section switching
function setupMenuNavigation() {
    const menuItems = document.querySelectorAll('.menu li:not(.logout)');
    const sections = document.querySelectorAll('.content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');

            // Logic to switch sections based on data-section attribute
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                sections.forEach(sec => sec.classList.add('hidden'));
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.remove('hidden');

                    // If switching to wishlist, render items
                    if (sectionId === 'my-wishlist') {
                        renderWishlistItems();
                    }
                }
            }

            const menuText = this.textContent.trim();
            console.log(`Navigating to: ${menuText}`);
        });
    });
}

// Wishlist Rendering Logic
function renderWishlistItems() {
    const grid = document.getElementById('wishlist-grid');
    const emptyState = document.getElementById('wishlist-empty');
    if (!grid || !emptyState || !window.WishlistManager) return;

    // Fetch items and ensure we have an array
    const rawItems = window.WishlistManager.getItems();
    const items = Array.isArray(rawItems) ? rawItems : [];

    // Clear grid initially to prevent glitches
    grid.innerHTML = '';

    // Robust check for items length to toggle visibility
    if (items.length > 0) {
        // Hide empty state if there are products - using style.display to bypass CSS specificity issues
        emptyState.style.display = 'none';
        emptyState.classList.add('hidden');

        // Render items to the grid
        grid.innerHTML = items.map(p => {
            const productImage = (p.images && p.images.length > 0)
                ? p.images[0]
                : 'https://placehold.co/400x400/10B981/ffffff?text=Product';

            return `
                <div class="wishlist-item-card">
                    <button class="remove-wishlist" onclick="removeAndRefresh(${p.id})">
                        &times;
                    </button>
                    <img src="${productImage}" alt="${p.name}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;">
                    <div class="wishlist-details">
                        <h4 style="margin: 0 0 8px; font-size: 1.1rem; color: #1e293b;">${p.name}</h4>
                        <p style="color: #1b8f4b; font-weight: 700; font-size: 1.2rem; margin-bottom: 12px;">₹${p.price}</p>
                        <button onclick="handleProfileAddToCart(${p.id})"
                            style="width: 100%; padding: 10px; background: #1b8f4b; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;"
                            onmouseover="this.style.background='#157a3f'"
                            onmouseout="this.style.background='#1b8f4b'">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // Show empty state only if items are strictly 0
        emptyState.style.display = 'block';
        emptyState.classList.remove('hidden');
    }
}

// Remove item and update UI
window.removeAndRefresh = function(id) {
    if (window.WishlistManager) {
        const items = window.WishlistManager.getItems();
        const product = items.find(p => p.id === id);
        if (product) {
            window.WishlistManager.toggleItem(product);
            renderWishlistItems();
            updateWishlistCount();
        }
    }
};

// Update the stat cards count
function updateWishlistCount() {
    const rawItems = window.WishlistManager ? window.WishlistManager.getItems() : [];
    const items = Array.isArray(rawItems) ? rawItems : [];
    const countDisplay = document.getElementById('wishlist-stat-count');
    if (countDisplay) {
        countDisplay.textContent = items.length;
    }
}

// Handle cart addition from within profile - IMPROVED VERSION
window.handleProfileAddToCart = function(productId) {
    console.log('Adding product to cart:', productId);

    // Try to get product from wishlist items first
    let product = null;

    if (window.WishlistManager) {
        const wishlistItems = window.WishlistManager.getItems();
        product = wishlistItems.find(p => p.id === productId);
    }

    // Fallback to MOCK_PRODUCTS if available
    if (!product && window.MOCK_PRODUCTS) {
        product = window.MOCK_PRODUCTS.find(p => p.id === productId);
    }

    if (product && window.CartManager) {
        // Ensure CartManager is initialized
        if (typeof window.CartManager.init === 'function') {
            window.CartManager.init();
        }

        // Add item to cart
        window.CartManager.addItem(product);

        // Show success notification
        if (window.showToast) {
            window.showToast(`${product.name} added to cart!`, 'success');
        } else {
            showNotification(`${product.name} added to cart!`, 'success');
        }

        console.log('Product added to cart successfully');
    } else {
        console.error('Product not found or CartManager not available');
        if (window.showToast) {
            window.showToast('Failed to add item to cart', 'error');
        } else {
            showNotification('Failed to add item to cart', 'error');
        }
    }
};

// Logout Modal Functions
function confirmLogout() {
    const modal = document.getElementById('logoutModal');
    if (modal) modal.classList.add('active');

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) modal.classList.remove('active');

    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('logoutModal');
    if (event.target === modal) {
        closeLogoutModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLogoutModal();
    }
});

// Form Validation
function setupFormValidation() {
    const form = document.querySelector('.profile-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input:not([disabled]), select');

    inputs.forEach(input => {
        // Real-time validation on blur
        input.addEventListener('blur', function() {
            validateField(this);
        });

        // Remove error styling on focus
        input.addEventListener('focus', function() {
            this.classList.remove('error');
            removeFieldError(this);
        });
    });

    // Form submit validation
    form.addEventListener('submit', function(e) {
        // Only prevent default if we want to handle via JS/AJAX,
        // otherwise let standard POST happen after validation.
        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (isValid) {
            showSaveLoading();
        } else {
            e.preventDefault();
            showNotification('Please correct the errors before saving', 'error');
        }
    });
}

// Password Change Form Validation
function setupPasswordValidation() {
    const passwordForm = document.getElementById('password-change-form');
    if (!passwordForm) return;

    const oldPassword = document.getElementById('old_password');
    const newPassword1 = document.getElementById('new_password1');
    const newPassword2 = document.getElementById('new_password2');

    // Real-time password strength validation
    if (newPassword1) {
        newPassword1.addEventListener('input', function() {
            validatePasswordStrength(this);
        });
    }

    // Confirm password match validation
    if (newPassword2) {
        newPassword2.addEventListener('input', function() {
            validatePasswordMatch(newPassword1, this);
        });
    }

    // Form submission validation
    passwordForm.addEventListener('submit', function(e) {
        let isValid = true;

        // Validate old password
        if (!oldPassword.value.trim()) {
            showFieldError(oldPassword, 'Current password is required');
            isValid = false;
        }

        // Validate new password
        if (!validatePasswordStrength(newPassword1)) {
            isValid = false;
        }

        // Validate password match
        if (!validatePasswordMatch(newPassword1, newPassword2)) {
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
            showNotification('Please fix the errors before submitting', 'error');
        } else {
            showSaveLoading('.password-form .save-btn');
        }
    });
}

// Validate password strength
function validatePasswordStrength(passwordField) {
    const password = passwordField.value;
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    if (errors.length > 0) {
        showFieldError(passwordField, errors[0]);
        return false;
    } else {
        removeFieldError(passwordField);
        passwordField.classList.remove('error');
        return true;
    }
}

// Validate password match
function validatePasswordMatch(password1Field, password2Field) {
    const password1 = password1Field.value;
    const password2 = password2Field.value;

    if (password2 && password1 !== password2) {
        showFieldError(password2Field, 'Passwords do not match');
        return false;
    } else {
        removeFieldError(password2Field);
        password2Field.classList.remove('error');
        return true;
    }
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;

    // Skip disabled fields
    if (field.disabled) return true;

    // Check required fields
    if (field.required && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }

    // Specific validation based on field type
    switch(fieldName) {
        case 'full_name':
            if (value && value.length < 2) {
                showFieldError(field, 'Name must be at least 2 characters');
                return false;
            }
            if (value && !/^[a-zA-Z\s]+$/.test(value)) {
                showFieldError(field, 'Name can only contain letters');
                return false;
            }
            break;

        case 'mobile':
            if (value && !/^[\d\s\+\-\(\)]+$/.test(value)) {
                showFieldError(field, 'Please enter a valid mobile number');
                return false;
            }
            break;

        case 'postal_code':
            if (value && !/^\d{6}$/.test(value)) {
                showFieldError(field, 'Please enter a valid 6-digit PIN code');
                return false;
            }
            break;
    }

    // If validation passes
    field.classList.remove('error');
    removeFieldError(field);
    return true;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');

    // Remove existing error message
    removeFieldError(field);

    // Create and append error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

    field.parentElement.appendChild(errorDiv);
}

// Remove field error
function removeFieldError(field) {
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Show save loading state
function showSaveLoading(selector = '.save-btn') {
    const saveBtn = document.querySelector(selector);
    if (!saveBtn) return;
    
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Auto-save indicator
function setupAutoSaveIndicator() {
    const form = document.querySelector('.profile-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input:not([disabled]), select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Show "unsaved changes" indicator
            showUnsavedIndicator();
        });
    });
}

function showUnsavedIndicator() {
    const saveBtn = document.querySelector('.save-btn');
    if (!saveBtn || saveBtn.classList.contains('unsaved')) return;
    
    saveBtn.classList.add('unsaved');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Unsaved Changes';
    
    // Reset after some time if no more changes occur
    setTimeout(() => {
        if (saveBtn.classList.contains('unsaved')) {
            saveBtn.classList.remove('unsaved');
            saveBtn.innerHTML = originalText;
        }
    }, 8000);
}

// Animate stats on scroll
function animateStatsOnScroll() {
    const statCards = document.querySelectorAll('.stat-card');
    if (!statCards.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = 'slideIn 0.5s ease forwards';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    statCards.forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
}

// Mobile number formatting
function formatMobileNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    if (value.length > 5) value = value.slice(0, 5) + ' ' + value.slice(5);
    input.value = value;
}

// PIN code formatting
const pinInput = document.querySelector('input[name="postal_code"]');
if (pinInput) {
    pinInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 6);
    });
}

// Smooth scroll to top when page loads
window.addEventListener('load', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Handle browser back button
window.addEventListener('popstate', () => {
    closeLogoutModal();
});

// Export functions for use in HTML
window.confirmLogout = confirmLogout;
window.closeLogoutModal = closeLogoutModal;