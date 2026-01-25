// Updated checkout.js - Loads items from CartManager

let currentStep = 1;
const totalSteps = 5;
let cartItems = [];

// Load cart items on page load
function loadCartItems() {
    // Try to get from CartManager first
    if (window.CartManager) {
        cartItems = window.CartManager.getItems();
    } else {
        // Fallback to checkoutCart in localStorage
        const saved = localStorage.getItem('checkoutCart');
        if (saved) {
            try {
                cartItems = JSON.parse(saved);
            } catch (e) {
                cartItems = [];
            }
        }
    }

    // If cart is empty, redirect to products page
    if (cartItems.length === 0) {
        alert('Your cart is empty. Please add items before checkout.');
        window.location.href = '../products/';
        return;
    }

    renderCartItems();
    updateSummary();
}

// Render cart items in step 1
function renderCartItems() {
    const itemsList = document.querySelector('.items-list');
    if (!itemsList) return;

    itemsList.innerHTML = cartItems.map((item, index) => `
        <li class="item-row">
            <img src="${item.image || 'https://placehold.co/100x100/34D399/ffffff?text=Product'}"
                 alt="${item.name}"
                 class="item-image"
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 12px;"
                 onerror="this.src='https://placehold.co/100x100/34D399/ffffff?text=Product'">
            <span class="item-name">${item.name}</span>
            <div class="item-controls">
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateCartItemQty(${item.id}, -1)">−</button>
                    <span class="qty-display" id="qty${item.id}">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartItemQty(${item.id}, 1)">+</button>
                </div>
                <span class="item-price" id="price${item.id}">₹${(item.price * item.quantity).toFixed(2)}</span>
                <button class="remove-btn" onclick="removeCartItem(${item.id})" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

// Update quantity in cart
function updateCartItemQty(itemId, change) {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    const newQty = item.quantity + change;

    if (newQty <= 0) {
        removeCartItem(itemId);
        return;
    }

    if (newQty > 10) return; // Max 10 items

    item.quantity = newQty;

    // Update in CartManager if available
    if (window.CartManager) {
        window.CartManager.updateQuantity(itemId, newQty);
        cartItems = window.CartManager.getItems();
    } else {
        localStorage.setItem('checkoutCart', JSON.stringify(cartItems));
    }

    // Update display
    const qtyDisplay = document.getElementById(`qty${itemId}`);
    const priceDisplay = document.getElementById(`price${itemId}`);

    if (qtyDisplay) qtyDisplay.textContent = newQty;
    if (priceDisplay) priceDisplay.textContent = `₹${(item.price * newQty).toFixed(2)}`;

    updateSummary();
}

// Remove item from cart
function removeCartItem(itemId) {
    if (confirm('Remove this item from cart?')) {
        cartItems = cartItems.filter(i => i.id !== itemId);

        // Update in CartManager if available
        if (window.CartManager) {
            window.CartManager.removeItem(itemId);
            cartItems = window.CartManager.getItems();
        } else {
            localStorage.setItem('checkoutCart', JSON.stringify(cartItems));
        }

        if (cartItems.length === 0) {
            alert('Your cart is now empty.');
            window.location.href = '../products/';
            return;
        }

        renderCartItems();
        updateSummary();
    }
}

function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = percentage + '%';

    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function validateContactInfo() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const wp = document.getElementById('wp').value.trim();
    const altphone = document.getElementById('altphone').value.trim();

    if (!firstName) {
        alert('Please enter your first name');
        document.getElementById('firstName').focus();
        return false;
    }
    if (!lastName) {
        alert('Please enter your last name');
        document.getElementById('lastName').focus();
        return false;
    }
    if (!phone) {
        alert('Please enter your phone number');
        document.getElementById('phone').focus();
        return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        alert('Please enter a valid 10-digit phone number');
        document.getElementById('phone').focus();
        return false;
    }

    if (!email) {
        alert('Please enter your email address');
        document.getElementById('email').focus();
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        document.getElementById('email').focus();
        return false;
    }

    if (!wp) {
        alert('Please enter your WhatsApp number');
        document.getElementById('wp').focus();
        return false;
    }

    if (!phoneRegex.test(wp)) {
        alert('Please enter a valid 10-digit WhatsApp number');
        document.getElementById('wp').focus();
        return false;
    }

    if (!altphone) {
        alert('Please enter your alternate phone number');
        document.getElementById('altphone').focus();
        return false;
    }

    if (!phoneRegex.test(altphone)) {
        alert('Please enter a valid 10-digit alternate phone number');
        document.getElementById('altphone').focus();
        return false;
    }

    return true;
}

function validateDeliveryInfo() {
    const address1 = document.getElementById('address1').value.trim();
    const address2 = document.getElementById('address2').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value;
    const pincode = document.getElementById('pincode').value.trim();

    if (!address1) {
        alert('Please enter your house/flat/street address');
        document.getElementById('address1').focus();
        return false;
    }
    if (!address2) {
        alert('Please enter your locality/area');
        document.getElementById('address2').focus();
        return false;
    }
    if (!city) {
        alert('Please enter your city/town');
        document.getElementById('city').focus();
        return false;
    }
    if (!state) {
        alert('Please select your state');
        document.getElementById('state').focus();
        return false;
    }
    if (!pincode) {
        alert('Please enter your pincode');
        document.getElementById('pincode').focus();
        return false;
    }

    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
        alert('Please enter a valid 6-digit pincode');
        document.getElementById('pincode').focus();
        return false;
    }

    return true;
}

function changeStep(direction) {
    // Enable validation by uncommenting
    if (direction === 1) {
        // if (currentStep === 2 && !validateContactInfo()) return;
        // if (currentStep === 3 && !validateDeliveryInfo()) return;
    }

    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    currentStepElement.classList.remove('active');

    currentStep += direction;

    if (currentStep < 1) currentStep = 1;
    if (currentStep > totalSteps) currentStep = totalSteps;

    const newStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    newStepElement.classList.add('active');

    updateProgressBar();
    updateButtons();

    if (currentStep === 4) {
        updateSummary();
    }
}

function updateButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-block';

    if (currentStep === totalSteps) {
        nextBtn.textContent = 'Place Order';
        nextBtn.onclick = placeOrder;
    } else {
        nextBtn.textContent = 'Next';
        nextBtn.onclick = () => changeStep(1);
    }
}

function getDonationAmount() {
    const donationRadio = document.querySelector('input[name="donation"]:checked');
    const customAmountRaw = document.getElementById('customAmount').value;
    let donationAmount = 0;

    if (customAmountRaw && parseFloat(customAmountRaw) > 0) {
        donationAmount = parseFloat(customAmountRaw);
    } else if (donationRadio) {
        donationAmount = parseFloat(donationRadio.value) || 0;
    }
    return donationAmount;
}

function updateSummary() {
    // Calculate from actual cart items
    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const gst = subtotal * 0.03;
    const donation = getDonationAmount();
    const total = subtotal + gst + donation;

    const subEl = document.getElementById('summarySubtotal');
    const gstEl = document.getElementById('summaryGST');
    const donationEl = document.getElementById('summaryDonation');
    const totalEl = document.getElementById('summaryTotal');
    const finalTotalEl = document.getElementById('finalTotal');

    if (subEl) subEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (gstEl) gstEl.textContent = `₹${gst.toFixed(2)}`;
    if (donationEl) donationEl.textContent = `₹${donation.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
    if (finalTotalEl) finalTotalEl.textContent = `₹${total.toFixed(2)}`;
}

function placeOrder() {
    const donationAmount = getDonationAmount();

    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const gst = subtotal * 0.03;
    const finalTotal = subtotal + gst + donationAmount;

    // Clear cart after order
    if (window.CartManager) {
        window.CartManager.clear();
    }
    localStorage.removeItem('checkoutCart');

    // Redirect to thank you page
    window.location.href = "../thank/";
}

function attachDonationListeners() {
    document.querySelectorAll('input[name="donation"]').forEach(radio => {
        radio.addEventListener('change', updateSummary);
    });
    const customAmountInput = document.getElementById('customAmount');
    if (customAmountInput) {
        customAmountInput.addEventListener('input', updateSummary);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
    updateProgressBar();
    updateButtons();
    attachDonationListeners();
});

// Export functions
window.updateCartItemQty = updateCartItemQty;
window.removeCartItem = removeCartItem;
window.changeStep = changeStep;