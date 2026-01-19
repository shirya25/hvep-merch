// Updated home.js with cart integration

const featuredProducts = [
  {
    id: 'prod1',
    image: 'team1-assets/product-images/glass-jar-lantern.png',
    name: 'Recycled Paper Journal',
    tagline: 'Pen your thoughts sustainably.',
    price: 85,
  },
  {
    id: 'prod2',
    image: 'team1-assets/product-images/ChatGPT%20Image%20Nov%207%2C%202025%2C%2009_18_19%20PM.png',
    name: 'Glass Jar Lantern',
    tagline: 'Light up your world, eco-style.',
    price: 150,
  },
  {
    id: 'prod3',
    image: 'team1-assets/product-images/upcycled-tyre-pplanter.png',
    name: 'Upcycled Tire Planter',
    tagline: 'Give your plants a recycled home.',
    price: 120,
  },
  {
    id: 'prod4',
    image: 'team1-assets/product-images/woven-bag.png',
    name: 'Woven Plastic Tote Bag',
    tagline: 'Carry your essentials with purpose.',
    price: 100,
  },
  {
    id: 'prod5',
    image: 'team1-assets/product-images/cap-covers.png',
    name: 'Bottle Cap Coasters',
    tagline: 'Protect your surfaces with art.',
    price: 50,
  },
];

function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  featuredProducts.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="muted">${p.tagline}</p>
      </div>
      <div class="card-footer">
        <div class="price">${formatCurrency(p.price)}</div>
        <div class="card-actions">
          <button class="btn ghost wishlist" data-id="${p.id}" onclick="handleWishlist('${p.id}')">♥</button>
          <button class="btn" data-id="${p.id}" onclick="handleAddToCart('${p.id}')">Add to Cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Handle Add to Cart from home page
function handleAddToCart(productId) {
  const product = featuredProducts.find(p => p.id === productId);
  if (product && window.CartManager) {
    window.CartManager.addItem(product);
  }
}

// Handle Wishlist
function handleWishlist(productId) {
  alert('Added to wishlist (feature coming soon)');
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
  renderProducts();
  initHeroCarousel();
  initHeader();
  
  // Initialize cart if available
  if (window.CartManager) {
    window.CartManager.init();
  }
});

// Export functions
window.handleAddToCart = handleAddToCart;
window.handleWishlist = handleWishlist;