const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Bouquet Candle',
    price: 249,
    category: 'Candles',
    rating: 5,
    material: 'Soy Wax',
    info: 'Eco-friendly handcrafted candle',
    ecoScore: { carbon: 'A', water: 'A', waste: 'A+' },
    images: ['/static/merchandise/assets/product-images/Bouquet candle.png']
  },
  {
    id: 2,
    name: 'Bubble Candle',
    price: 199,
    category: 'Candles',
    rating: 4,
    material: 'Soy Wax',
    info: 'Minimal waste decorative candle',
    ecoScore: { carbon: 'A', water: 'A', waste: 'A' },
    images: ['/static/merchandise/assets/product-images/BUBBLE CANDLE.png']
  },
  {
    id: 3,
    name: 'Iced Coffee Latte Candle',
    price: 799,
    category: 'Candles',
    rating: 5,
    material: 'Gel Wax',
    info: 'Reusable glass jar candle',
    ecoScore: { carbon: 'A-', water: 'A', waste: 'A' },
    images: ['/static/merchandise/assets/product-images/Iced Coffee Latte.png']
  },
  {
    id: 4,
    name: 'Jar Candle',
    price: 149,
    category: 'Candles',
    rating: 4,
    material: 'Soy Wax',
    info: 'Long-lasting eco candle',
    ecoScore: { carbon: 'A', water: 'A', waste: 'A' },
    images: ['/static/merchandise/assets/product-images/Jar candle.png']
  },
  {
    id: 5,
    name: 'Moti Choor Ladoo Candle',
    price: 50,
    category: 'Candles',
    rating: 5,
    material: 'Soy Wax',
    info: 'Fun festive sustainable decor',
    ecoScore: { carbon: 'A', water: 'A', waste: 'A+' },
    images: ['/static/merchandise/assets/product-images/Motti choor ladoo candle.png']
  },
  {
    id: 6,
    name: 'Rose Candle',
    price: 99,
    category: 'Candles',
    rating: 4,
    material: 'Soy Wax',
    info: 'Hand-poured floral candle',
    ecoScore: { carbon: 'A', water: 'A', waste: 'A' },
    images: ['/static/merchandise/assets/product-images/Rose candle.png']
  },
  {
    id: 7,
    name: 'Sunflower Candle Jar',
    price: 129,
    category: 'Candles',
    rating: 5,
    material: 'Soy Wax',
    info: 'Reusable jar with sunflower art',
    ecoScore: { carbon: 'A', water: 'A', waste: 'A+' },
    images: ['/static/merchandise/assets/product-images/Sunflower candle Jar.png']
  },
  {
    id: 8,
    name: 'Teddy Candle',
    price: 99,
    category: 'Candles',
    rating: 4,
    material: 'Soy Wax',
    info: 'Cute decorative sustainable candle',
    ecoScore: { carbon: 'A', water: 'A', waste: 'A' },
    images: ['/static/merchandise/assets/product-images/Teddy Candle.png']
  },
  {
    id: 9,
    name: 'Jeera Namak',
    price: 150,
    pricePer100g: true,
    category: 'Food & Gourmet',
    rating: 5,
    material: 'Salt',
    info: 'Homemade Salt',
    ecoScore: { carbon: 'A', water: 'A+', waste: 'A+' },
    images: ['/static/merchandise/assets/product-images/jeera-namak.jpeg']
  },
  {
    id: 10,
    name: 'Lasoon Namak',
    price: 150,
    pricePer100g: true,
    category: 'Food & Gourmet',
    rating: 5,
    material: 'Salt',
    info: 'Homemade Salt',
    ecoScore: { carbon: 'A+', water: 'A', waste: 'A+' },
    images: ['/static/merchandise/assets/product-images/lasoon-namak.jpeg']
  },
  {
    id: 11,
    name: 'Bhaang Beej Namak',
    price: 150,
    pricePer100g: true,
    category: 'Food & Gourmet',
    rating: 4,
    material: 'Salt',
    info: 'Homemade Salt',
    ecoScore: { carbon: 'A', water: 'A', waste: 'A' },
    images: ['/static/merchandise/assets/product-images/bhaang-beej-namak.jpeg']
  }
];

let selectedProduct = null;
let currentImageIndex = 0;
let activeFilters = {
    categories: [],
    maxPrice: 5000,
    minRating: 0,
    sort: 'newest',
    searchTerm: ''
};

const SORT_OPTIONS = {
    'newest': 'Newest Arrivals',
    'price_asc': 'Price: Low to High',
    'price_desc': 'Price: High to Low',
    'rating_desc': 'Top Rated'
};

function getStarRatingHTML(rating) {
    const fullStars = '★'.repeat(rating);
    const emptyStars = '☆'.repeat(5 - rating);
    return `<span class="star-rating">${fullStars}${emptyStars}</span>`;
}

function toggleFilterModal(open) {
    const modal = document.getElementById('filter-modal');
    const desktopFilters = document.getElementById('filters-desktop-container');
    const modalPlaceholder = document.getElementById('filter-modal-content-placeholder');

    if (open) {
        modalPlaceholder.innerHTML = desktopFilters.innerHTML;
        modal.classList.add('open');
        modal.classList.remove('hidden');
        document.body.classList.add('body-scroll-lock');
    } else {
        modal.classList.remove('open');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.classList.remove('body-scroll-lock');
        }, 300);
    }
}

function showView(viewId) {
    document.getElementById('product-listing').classList.add('hidden');
    document.getElementById('product-detail').classList.add('hidden');
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
    }
    
    if (viewId === 'product-listing') {
        renderFilters(); 
        applyFilters(); 
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateSearchTerm(input) {
    activeFilters.searchTerm = input.value.trim().toLowerCase();
    applyFilters();
}

function renderFilters() {
    const categoryContainer = document.getElementById('category-filter'); 
    if (!categoryContainer) return;
    const categories = [...new Set(MOCK_PRODUCTS.map(p => p.category))];
    let html = '<p class="filter-label">Product Category</p>';
    
    categories.forEach(cat => {
        const isChecked = activeFilters.categories.includes(cat) ? 'checked' : '';
        html += `
            <label>
                <input type="checkbox" value="${cat}" ${isChecked} onchange="updateCategoryFilter(this)"> 
                ${cat}
            </label>
        `;
    });
    categoryContainer.innerHTML = html;
}

function toggleSortDropdown() {
    const dropdown = document.getElementById('sort-dropdown-menu');
    if (dropdown) {
        dropdown.classList.toggle('visible');
    }
}

function selectSortOption(value) {
    activeFilters.sort = value;
    const sortButtonText = document.getElementById('sort-current-value');
    if (sortButtonText) {
        sortButtonText.textContent = SORT_OPTIONS[value];
    }
    const dropdown = document.getElementById('sort-dropdown-menu');
    if (dropdown) {
        dropdown.classList.remove('visible');
    }
    applyFilters();
}

function updateCategoryFilter(checkbox) {
    const targetValue = checkbox.value;
    const isChecked = checkbox.checked;

    if (isChecked) {
        if (!activeFilters.categories.includes(targetValue)) {
            activeFilters.categories.push(targetValue);
        }
    } else {
        activeFilters.categories = activeFilters.categories.filter(c => c !== targetValue);
    }
    applyFilters();
}

function applyFilters() {
    const priceRangeInput = document.getElementById('price-range');
    if (priceRangeInput) {
        activeFilters.maxPrice = parseInt(priceRangeInput.value);
    }
    
    const ratingRadio = document.querySelector('#rating-filter input[name="rating"]:checked');
    activeFilters.minRating = ratingRadio ? parseInt(ratingRadio.value) : 0;

    const maxPriceDisplay = document.getElementById('max-price-display');
    if (maxPriceDisplay && priceRangeInput) {
        maxPriceDisplay.textContent = '₹' + priceRangeInput.value;
    }

    let filteredProducts = [...MOCK_PRODUCTS];

    filteredProducts = filteredProducts.filter(product => {
        const matchesCategory = activeFilters.categories.length === 0 || activeFilters.categories.includes(product.category);
        const matchesPrice = product.price <= activeFilters.maxPrice;
        const matchesRating = product.rating >= activeFilters.minRating;
        const matchesSearch = activeFilters.searchTerm === '' || product.name.toLowerCase().includes(activeFilters.searchTerm);

        return matchesCategory && matchesPrice && matchesRating && matchesSearch;
    });

    switch (activeFilters.sort) {
        case 'price_asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating_desc':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
        default:
            break;
    }

    renderProductGrid(filteredProducts);
}

function renderProductGrid(products) {
    const grid = document.getElementById('product-grid');
    const countDisplay = document.getElementById('product-count');
    
    if (countDisplay) {
        countDisplay.textContent = products.length;
    }
    
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<div class="no-results p-5 text-center text-gray-500 col-span-full">No products match your current search or filters.</div>';
        return;
    }

    grid.innerHTML = products.map(product => {
        const firstImage = product.images?.[0] || 'https://placehold.co/600x400/34D399/ffffff?text=Eco+Product';
        
        // Wishlist State Check
        const isWishlisted = window.WishlistManager?.isWishlisted(product.id);
        const heartClass = isWishlisted ? 'fa-solid fa-heart active' : 'fa-regular fa-heart';

        const per100gTag = product.pricePer100g 
            ? `<span class="price-per-100g text-xs text-gray-500 font-normal block"> (₹${product.price.toLocaleString('en-IN')} / 100g)</span>` 
            : '';

        return `
            <div class="product-card">
                <!-- Wishlist Toggle Button -->
                <div class="wishlist-float-btn" onclick="event.stopPropagation(); toggleProductWishlist(${product.id})">
                    <i class="${heartClass}" id="heart-prod-${product.id}"></i>
                </div>
                <div onclick="viewProductDetail(${product.id})">
                    <img 
                        src="${firstImage}" 
                        alt="${product.name}" 
                        class="product-image"
                        onerror="this.onerror=null;this.src='https://placehold.co/600x400/34D399/ffffff?text=Image+Missing';"
                    >
                    <div class="card-info">
                        <h4>${product.name}</h4>
                        <div class="flex justify-between items-center mt-2">
                            <div class="price-container">
                              <p class="card-price">₹${product.price.toLocaleString('en-IN')}</p>
                              ${per100gTag}
                            </div>
                            ${getStarRatingHTML(product.rating)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleProductWishlist(productId) {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (product && window.WishlistManager) {
        window.WishlistManager.toggleItem(product);
        applyFilters(); // Re-render to update the heart icons
    }
}

function navigateImage(direction) {
    const images = selectedProduct.images;
    if (!images || images.length <= 1) return;

    let newIndex = currentImageIndex + direction;

    if (newIndex < 0) {
        newIndex = images.length - 1;
    } else if (newIndex >= images.length) {
        newIndex = 0;
    }

    currentImageIndex = newIndex;
    
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.style.opacity = 0;
        setTimeout(() => {
            mainImage.src = images[currentImageIndex];
            mainImage.style.opacity = 1;
        }, 150);
    }
}

function renderEcoScore(score) {
    return `
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Sustainability Scorecard</h3>
        <div class="eco-score-container">
            <div class="score-item">
                <i class="fas fa-smog"></i>
                <div class="score-value text-red-500">${score.carbon}</div>
                <div class="score-label">Carbon Footprint</div>
            </div>
            <div class="score-item">
                <i class="fas fa-tint"></i>
                <div class="score-value text-blue-500">${score.water}</div>
                <div class="score-label">Water Usage</div>
            </div>
            <div class="score-item">
                <i class="fas fa-recycle"></i>
                <div class="score-value text-green-500">${score.waste}</div>
                <div class="score-label">Waste Reduction</div>
            </div>
        </div>
    `;
}

function viewProductDetail(productId) {
    selectedProduct = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!selectedProduct) return;

    const container = document.getElementById('detail-container');
    currentImageIndex = 0;

    if (!container) return;

    // Logic fix: Use product.price as the per-100g rate for Detail View
    const per100gTag = selectedProduct.pricePer100g 
        ? `<span class="detail-price-per-100g text-lg text-gray-500 font-medium ml-3"> (₹${selectedProduct.price.toLocaleString('en-IN')} / 100g)</span>` 
        : '';

    container.innerHTML = `
        <div class="detail-layout">
            <div class="gallery-col">
                <div class="image-carousel-wrapper">
                    <img id="main-product-image" 
                        src="${selectedProduct.images?.[0] || 'https://placehold.co/800x800/10B981/ffffff?text=Product+Image'}" 
                        alt="${selectedProduct.name}" 
                        class="detail-image"
                    >
                    <button class="gallery-button prev" onclick="navigateImage(-1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="gallery-button next" onclick="navigateImage(1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div class="detail-info">
                <div class="product-rating">
                    ${getStarRatingHTML(selectedProduct.rating)} (${selectedProduct.rating}.0 / 5)
                </div>
                <h2>${selectedProduct.name}</h2>
                <div class="detail-price-container flex items-baseline">
                  <p class="detail-price">₹${selectedProduct.price.toLocaleString('en-IN')}</p>
                  ${per100gTag}
                </div>

                <div class="eco-score-card">
                    ${renderEcoScore(selectedProduct.ecoScore)}
                </div>

                <div class="eco-story-box eco-story-section">
                    <h3 class="mb-4"><i class="fas fa-info-circle"></i> Description</h3>
                    
                    <div class="mb-2">
                        <p class="story-text text-gray-700">
                            <strong style="color: #15803d;">Material:</strong> ${selectedProduct.material}
                        </p>
                    </div>

                    <div>
                        <p class="story-text text-gray-700">
                            <strong style="color: #15803d;">Info:</strong> ${selectedProduct.info}
                        </p>
                    </div>
                </div>

                <button class="add-to-cart-btn" onclick="handleProductDetailAddToCart()">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;

    showView('product-detail');
}

function handleProductDetailAddToCart() {
    if (selectedProduct && window.CartManager) {
        window.CartManager.addItem(selectedProduct);
    }
}

// INTEGRATION: Added URL search parameter handling to initialization
function initProductApp() {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('q');
    
    if (searchQuery) {
        activeFilters.searchTerm = searchQuery.toLowerCase();
        // Also update the navbar input if it exists to match the current search
        const navbarSearch = document.getElementById('searchInput');
        if (navbarSearch) navbarSearch.value = searchQuery;
    }

    renderFilters();
    applyFilters();
    
    const listingView = document.getElementById('product-listing');
    const detailView = document.getElementById('product-detail');
    
    if (listingView) { listingView.classList.remove('hidden'); }
    if (detailView) { detailView.classList.add('hidden'); }
    
    // Initialize cart
    if (window.CartManager) {
        window.CartManager.init();
    }

    // Direct product link handling
    const productId = params.get('product');
    if (productId) {
        viewProductDetail(parseInt(productId));
    }
}

window.initProductApp = initProductApp;
window.updateSearchTerm = updateSearchTerm; 
window.toggleSortDropdown = toggleSortDropdown;
window.selectSortOption = selectSortOption;
window.updateCategoryFilter = updateCategoryFilter;
window.viewProductDetail = viewProductDetail;
window.navigateImage = navigateImage;
window.handleProductDetailAddToCart = handleProductDetailAddToCart;
window.toggleFilterModal = toggleFilterModal;
window.applyFilters = applyFilters;
window.toggleProductWishlist = toggleProductWishlist;
window.MOCK_PRODUCTS = MOCK_PRODUCTS;