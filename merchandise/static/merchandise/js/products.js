
const MOCK_PRODUCTS = [
    { id: 1, name: 'Eco Bamboo Toothbrush', price: 499, category: 'Personal Care', rating: 5, material: 'Sustainable Bamboo', impact: 'Reduces plastic waste', ecoScore: { carbon: 'A-', water: 'A', waste: 'A+' }, images: ['https://placehold.co/800x800/10B981/ffffff?text=Image+1', 'https://placehold.co/800x800/059669/ffffff?text=Image+2'] },
    { id: 2, name: 'Recycled Cotton Tote', price: 749, category: 'Accessories', rating: 4, material: 'Recycled Cotton', impact: 'Saves water resources', ecoScore: { carbon: 'B+', water: 'A', waste: 'B' }, images: ['https://placehold.co/800x800/3b82f6/ffffff?text=Image+1'] },
    { id: 3, name: 'Natural Beeswax Candle', price: 599, category: 'Home Goods', rating: 5, material: 'Pure Beeswax', impact: 'Carbon neutral burning', ecoScore: { carbon: 'A', water: 'B-', waste: 'A' }, images: ['https://placehold.co/800x800/f59e0b/ffffff?text=Image+1'] },
    { id: 4, name: 'Upcycled Leather Wallet', price: 1899, category: 'Accessories', rating: 5, material: 'Reclaimed Leather', impact: 'Prevents landfill waste', ecoScore: { carbon: 'A+', water: 'A+', waste: 'A' }, images: ['https://placehold.co/800x800/4c4c4c/ffffff?text=Image+1'] },
    { id: 5, name: 'Glass Jar Storage Set', price: 450, category: 'Home Goods', rating: 4, material: 'Recycled Glass', impact: 'Reusable storage', ecoScore: { carbon: 'B', water: 'B', waste: 'A+' }, images: ['https://placehold.co/800x800/6b7280/ffffff?text=Image+1'] },
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
    if (categoryContainer) {
        categoryContainer.innerHTML = html;
    }
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
        grid.innerHTML = '<div class="no-results p-5 text-center text-gray-500 col-span-full">No products match your current filters.</div>';
        return;
    }

    grid.innerHTML = products.map(product => {
        const firstImage = product.images?.[0] || 'https://placehold.co/600x400/34D399/ffffff?text=Eco+Product';
        return `
            <div class="product-card" onclick="viewProductDetail(${product.id})">
                <img 
                    src="${firstImage}" 
                    alt="${product.name}" 
                    class="product-image"
                    onerror="this.onerror=null;this.src='https://placehold.co/600x400/34D399/ffffff?text=Image+Missing';"
                >
                <div class="card-info">
                    <h4>${product.name}</h4>
                    <div class="flex justify-between items-center mt-2">
                        <p class="card-price">₹${product.price.toLocaleString('en-IN')}</p>
                        ${getStarRatingHTML(product.rating)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
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
                <p class="detail-price">₹${selectedProduct.price.toLocaleString('en-IN')}</p>

                <div class="eco-score-card">
                    ${renderEcoScore(selectedProduct.ecoScore)}
                </div>

                <div class="eco-story-box eco-story-section">
                    <h3><i class="fas fa-seedling"></i> The Story Behind It</h3>
                    <p class="story-text text-gray-700">
                        Made with ${selectedProduct.material}. ${selectedProduct.impact}.
                    </p>
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
        const productForCart = {
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            image: selectedProduct.images?.[0] || '',
            images: selectedProduct.images
        };
        window.CartManager.addItem(productForCart);
    }
}

function initProductApp() {
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