function getHomeProducts() {
  return window.MOCK_PRODUCTS ? window.MOCK_PRODUCTS.slice(0, 9) : [];
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  // clear old content (important)
  grid.innerHTML = '';

  if (!window.MOCK_PRODUCTS || !window.MOCK_PRODUCTS.length) {
    console.warn('Products not loaded yet, retrying...');
    setTimeout(renderProducts, 200);
    return;
  }

  // Slice to show 9 products instead of 4
  const products = window.MOCK_PRODUCTS.slice(0, 9);

  products.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'card';
    
    // WISHLIST INTEGRATION: Check if this specific item is already in the wishlist
    const isSaved = window.WishlistManager ? window.WishlistManager.isWishlisted(p.id) : false;
    const heartIcon = isSaved ? 'fa-solid fa-heart active' : 'fa-regular fa-heart';

    // Conditional Per 100g Price Tag for Home Grid
    // Uses p.price directly as the per-100g rate for gourmet items
    const per100gTag = p.pricePer100g 
      ? `<span class="price-per-100g" style="font-size: 0.75rem; color: #6b7280; font-weight: 400; display: block;"> (₹${p.price} / 100g)</span>` 
      : '';

    card.innerHTML = `
      <!-- Wishlist Toggle Button -->
      <div class="wishlist-float-btn" onclick="event.stopPropagation(); toggleWishlist(${p.id})">
        <i class="${heartIcon}" id="heart-home-${p.id}"></i>
      </div>

      <div class="card-clickable" onclick="openProduct(${p.id})">
        <img 
          src="${p.images[0]}" 
          alt="${p.name}" 
          loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/400x400/10B981/ffffff?text=${encodeURIComponent(p.name)}';"
        >
        <div class="card-body">
          <h3>${p.name}</h3>
        </div>
        <div class="card-footer" style="flex-direction: column; align-items: center; padding-top: 8px;">
          <div class="price">${formatCurrency(p.price)}</div>
          ${per100gTag}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Global function to handle the wishlist toggle
window.toggleWishlist = function(productId) {
    const product = window.MOCK_PRODUCTS.find(p => p.id === productId);
    if (product && window.WishlistManager) {
        window.WishlistManager.toggleItem(product);
        renderProducts(); // Refresh the grid to update icons
    }
};

// Handle Add to Cart from home page
function handleAddToCart(productId) {
  const product = window.MOCK_PRODUCTS.find(p => p.id === productId);
  if (product && window.CartManager) {
    window.CartManager.addItem(product);
  }
}

// Handle Wishlist (Updated to use the Manager)
function handleWishlist(productId) {
  const product = window.MOCK_PRODUCTS.find(p => p.id === productId);
  if (product && window.WishlistManager) {
    window.WishlistManager.toggleItem(product);
    renderProducts();
  }
}

// Currency formatting helper for Indian Rupees
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

function formatCurrency(value) {
  return inrFormatter.format(value);
}

// Enhanced carousel with indicators
function initHeroCarousel() {
  const slides = Array.from(document.querySelectorAll('#hero .slide'));
  if (!slides.length) return;
  let idx = slides.findIndex((s) => s.classList.contains('active'));
  if (idx < 0) idx = 0;
  const total = slides.length;
  const prevBtn = document.getElementById('hero-prev');
  const nextBtn = document.getElementById('hero-next');
  const indicators = Array.from(document.querySelectorAll('.indicator'));

  function show(i, updateIndicators = true) {
    i = ((i % total) + total) % total;
    slides.forEach((s, si) => {
      const active = si === i;
      s.classList.toggle('active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    if (updateIndicators) {
      indicators.forEach((ind, ii) => ind.classList.toggle('active', ii === i));
    }
    idx = i;
  }

  prevBtn && prevBtn.addEventListener('click', () => {
    show(idx - 1);
    restartAutoplay();
  });
  nextBtn && nextBtn.addEventListener('click', () => {
    show(idx + 1);
    restartAutoplay();
  });

  indicators.forEach((ind, i) => {
    ind.addEventListener('click', () => {
      show(i);
      restartAutoplay();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { show(idx - 1); restartAutoplay(); }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { show(idx + 1); restartAutoplay(); }
  });

  let autoplay = null;
  function startAutoplay() {
    stopAutoplay();
    autoplay = setInterval(() => show(idx + 1), 5000);
  }
  function stopAutoplay() {
    if (autoplay) { clearInterval(autoplay); autoplay = null; }
  }
  function restartAutoplay() { stopAutoplay(); startAutoplay(); }

  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mouseenter', stopAutoplay);
    hero.addEventListener('mouseleave', startAutoplay);
    hero.addEventListener('focusin', stopAutoplay);
    hero.addEventListener('focusout', startAutoplay);
  }

  show(idx);
  startAutoplay();
}

// Header scroll behavior and mobile menu
function initHeader() {
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (!header || !menuToggle || !mainNav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });

  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', mainNav.classList.contains('active'));
  });

  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      mainNav.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  mainNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      mainNav.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Wait for products.js to load MOCK_PRODUCTS
  const checkProducts = setInterval(() => {
    if (window.MOCK_PRODUCTS) {
      clearInterval(checkProducts);
      renderProducts();
    }
  }, 100);
  
  initHeroCarousel();
  initHeader();
  
  // Initialize cart if available
  if (window.CartManager) {
    window.CartManager.init();
  }
});

function openProduct(productId) {
  const link = document.querySelector('a[href*="products"]');
  if (!link) return;

  window.location.href = `${link.href}?product=${productId}`;
}

function openDonationModal() {
  document.getElementById('donation-modal')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDonationModal() {
  document.getElementById('donation-modal')?.classList.add('hidden');
  document.body.style.overflow = '';
}

let donationAmount = 0;

function selectAmount(amount, btn) {
  donationAmount = amount;

  // Update text
  document.getElementById("selectedAmount").textContent = `₹${amount}`;

  // Fill custom input
  const customInput = document.getElementById("customAmount");
  if (customInput) customInput.value = amount;

  // Active state handling
  document.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

function selectCustomAmount() {
  const customInput = document.getElementById("customAmount");
  const value = parseInt(customInput.value) || 0;

  donationAmount = value;
  document.getElementById("selectedAmount").textContent = `₹${value}`;

  // Remove active state from preset buttons
  document.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("active"));
}

// Export functions
window.handleAddToCart = handleAddToCart;
window.handleWishlist = handleWishlist;
window.openProduct = openProduct;
window.openDonationModal = openDonationModal;
window.closeDonationModal = closeDonationModal;