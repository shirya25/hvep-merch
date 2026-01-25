// ========================================
// Shopping Cart Manager - Integrated with Products
// ========================================

const CartManager = (function() {
  let cartItems = [];
  const CART_KEY = 'ecoShopCart';

  // Initialize cart
  function init() {
    loadFromStorage();
    updateCartDisplay();
    console.log('CartManager initialized with', cartItems.length, 'items');
  }

  // Load cart from localStorage
  function loadFromStorage() {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try {
        cartItems = JSON.parse(saved);
      } catch (e) {
        cartItems = [];
      }
    }
  }

  // Save cart to localStorage
  function saveToStorage() {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    console.log('Cart saved:', cartItems);
  }

  // Add item to cart
  function addItem(product) {
    console.log('Adding to cart:', product);
    const existingItem = cartItems.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
      console.log('Increased quantity for:', product.name);
    } else {
      cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image || '',
        quantity: 1,
        rating: product.rating || 0,
        ecoRating: product.ecoScore ? 5 : 4
      });
      console.log('Added new item:', product.name);
    }

    saveToStorage();
    updateCartDisplay();
    showToast(`${product.name} added to cart!`);
  }

  // Remove item from cart
  function removeItem(itemId) {
    cartItems = cartItems.filter(item => item.id !== itemId);
    saveToStorage();
    updateCartDisplay();
  }

  // Update item quantity
  function updateQuantity(itemId, newQuantity) {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      item.quantity = Math.max(1, Math.min(10, newQuantity));
      saveToStorage();
      updateCartDisplay();
    }
  }

  // Clear entire cart
  function clear() {
    cartItems = [];
    saveToStorage();
    updateCartDisplay();
  }

  // Get all items
  function getItems() {
    return cartItems;
  }

  // Get cart count
  function getCount() {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Update cart display (for cart page)
  function updateCartDisplay() {
    const emptyCart = document.getElementById('empty-cart');
    const cartWithItems = document.getElementById('cart-with-items');
    const cartItemsList = document.getElementById('cart-items-list');
    const totalItemsSpan = document.getElementById('total-items');

    // If elements don't exist, we're not on the cart page
    if (!emptyCart || !cartWithItems) return;

    if (cartItems.length === 0) {
      emptyCart.classList.remove('hidden');
      cartWithItems.classList.add('hidden');
      return;
    }

    emptyCart.classList.add('hidden');
    cartWithItems.classList.remove('hidden');

    const totalItems = getCount();
    totalItemsSpan.textContent = totalItems;

    cartItemsList.innerHTML = cartItems.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image || 'https://placehold.co/400x400/34D399/ffffff?text=Product'}"
             alt="${item.name}"
             class="item-image"
             onerror="this.src='https://placehold.co/400x400/34D399/ffffff?text=Image+Missing'">
        <div class="item-details">
          <div class="item-header">
            <h3 class="item-name">${item.name}</h3>
            <span class="item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
          </div>
          <div class="item-rating">
            <span class="stars">${generateStars(item.rating)}</span>
          </div>
          <div class="item-eco-badge">
            <i class="fas fa-leaf"></i>
            Eco Rating: ${item.ecoRating}/5
          </div>
          <div class="item-actions">
            <div class="quantity-control">
              <button class="qty-btn" onclick="CartManager.updateQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                <i class="fas fa-minus"></i>
              </button>
              <span class="qty-display">${item.quantity}</span>
              <button class="qty-btn" onclick="CartManager.updateQuantity(${item.id}, ${item.quantity + 1})" ${item.quantity >= 10 ? 'disabled' : ''}>
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <button class="remove-btn" onclick="CartManager.confirmRemove(${item.id}, '${item.name.replace(/'/g, "\\'")}')">
              <i class="fas fa-trash-alt"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');

    updateEcoImpact();
  }

  // Generate star rating HTML
  function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>';
    }

    return stars;
  }

  // Update eco impact stats
  function updateEcoImpact() {
    const carbonSavedEl = document.getElementById('carbon-saved');
    const itemsCountEl = document.getElementById('items-count');

    if (carbonSavedEl) {
      const carbonSaved = cartItems.reduce((sum, item) => sum + (item.quantity * 1.5), 0);
      carbonSavedEl.textContent = carbonSaved.toFixed(1);
    }

    if (itemsCountEl) {
      itemsCountEl.textContent = getCount();
    }
  }

  // Confirm remove item
  function confirmRemove(itemId, itemName) {
    if (confirm(`Remove "${itemName}" from cart?`)) {
      removeItem(itemId);
      showToast('Item removed from cart');
    }
  }

  return {
    init,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    getItems,
    getCount,
    confirmRemove
  };
})();

// Global functions for cart page
function clearCart() {
  if (CartManager.getItems().length === 0) return;

  if (confirm('Are you sure you want to clear your entire cart?')) {
    CartManager.clear();
    showToast('Cart cleared');
  }
}

function proceedToCheckout() {
  const items = CartManager.getItems();

  if (items.length === 0) {
    showToast('Your cart is empty!');
    return;
  }

  // Save cart data for checkout page
  localStorage.setItem('checkoutCart', JSON.stringify(items));

  // Get the checkout URL from the template or use a default
  window.location.href = '../checkout/';
}

// Show toast notification - creates element if it doesn't exist
function showToast(message) {
  let toast = document.getElementById('toast');
  let toastMessage = document.getElementById('toast-message');

  // Create toast if it doesn't exist
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast hidden';
    toast.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span id="toast-message"></span>
    `;
    document.body.appendChild(toast);
    toastMessage = document.getElementById('toast-message');
  }

  toastMessage.textContent = message;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
  CartManager.init();
});

// Export CartManager globally
window.CartManager = CartManager;
window.showToast = showToast;