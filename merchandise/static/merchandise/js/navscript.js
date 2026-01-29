// Cart Management - Integrated with CartManager from cart.js
let cart = [];
let cartCount = 0;

// Initialize cart from localStorage if available
function initCart() {
    // Wait for CartManager to be available
    if (window.CartManager) {
        updateCartDisplay();
        // Set up periodic updates to sync cart count
        setInterval(updateCartDisplay, 500);
    } else {
        // Retry after a short delay if CartManager isn't loaded yet
        setTimeout(initCart, 100);
    }
}

// Update cart count display
function updateCartDisplay() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement && window.CartManager) {
        const count = window.CartManager.getCount();
        cartCountElement.textContent = count;

        // Add animation when count changes
        if (count !== cartCount) {
            cartCountElement.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartCountElement.style.transform = 'scale(1)';
            }, 200);
        }

        cartCount = count;
        cart = window.CartManager.getItems();
    }
}

// Add item to cart - delegates to CartManager
function addToCart(item) {
    if (window.CartManager) {
        window.CartManager.addItem(item);
        // Notification is already shown by CartManager
    } else {
        console.error('CartManager not available');
    }
}

// Save cart to localStorage - handled by CartManager
function saveCart() {
    // This is now handled by CartManager
}
// Show cart notification
function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #4a7c2c;
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Search Functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categorySelect = document.getElementById('categorySelect');

function performSearch() {
    const searchTerm = searchInput.value.trim();
    // Use optional chaining or check in case categorySelect isn't always present
    const category = categorySelect ? categorySelect.value : 'All';

    if (searchTerm === '') {
        showNotification('Please enter a search term', 'warning');
        return;
    }

    console.log('Searching for:', searchTerm, 'in category:', category);

    // INTEGRATION: Check if we are on the products page
    const isProductsPage = document.getElementById('product-listing') !== null;

    if (isProductsPage && window.updateSearchTerm && typeof window.updateSearchTerm === 'function') {
        // Case A: User is already on the products page - Filter instantly
        window.updateSearchTerm(searchInput);
        showNotification(`Filtering for "${searchTerm}"...`, 'info');
    } else {
        // Case B: User is on Home or Login - Redirect to products page with query parameter
        // Adjust the path below if your Django URL structure for products is different
        window.location.href = '/merch/products/?q=' + encodeURIComponent(searchTerm);
    }
}

// --- RECOMMENDATIONS LOGIC ---
function showSearchRecommendations(query) {
    // Remove any existing dropdown
    let existingDropdown = document.querySelector('.search-recommendations');
    if (existingDropdown) existingDropdown.remove();

    if (!query || query.length < 1) return;

    // Filter MOCK_PRODUCTS for matching names (Case-insensitive)
    // MOCK_PRODUCTS is globally available if products.js is loaded
    const products = window.MOCK_PRODUCTS || [];
    const matches = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8); // Max 8 matches

    if (matches.length === 0) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'search-recommendations';
    
    matches.forEach(product => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        
        // Highlight matching text
        const regex = new RegExp(`(${query})`, 'gi');
        const highlightedName = product.name.replace(regex, '<strong>$1</strong>');
        
        item.innerHTML = `<i class="fas fa-search"></i> <span>${highlightedName}</span>`;
        
        // IMPORTANT: Use mousedown to ensure the click registers before the input's blur event
        item.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent focus loss
            window.location.href = '/merch/products/?q=' + encodeURIComponent(product.name);
        });
        dropdown.appendChild(item);
    });

    const searchBarContainer = document.querySelector('.search-bar');
    if (searchBarContainer) {
        searchBarContainer.appendChild(dropdown);
    }
}

// Search on button click
if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
}

// Search on Enter key
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Integrated real-time filtering and recommendations
    searchInput.addEventListener('input', (e) => {
        const isProductsPage = document.getElementById('product-listing') !== null;
        const value = e.target.value.trim();

        if (isProductsPage && window.updateSearchTerm && typeof window.updateSearchTerm === 'function') {
            // Live filter the actual product cards on the products page
            window.updateSearchTerm(e.target);
        } else if (!isProductsPage) {
            // Show recommendations dropdown on non-product pages (Home)
            showSearchRecommendations(value);
        }

        if (value.length >= 3) {
            // Here you could show search suggestions
            console.log('Show suggestions for:', value);
        }
    });

    // Close dropdown on blur (user clicks away)
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            const dropdown = document.querySelector('.search-recommendations');
            if (dropdown) dropdown.remove();
        }, 200);
    });
}

// Cart Button Click
const cartBtn = document.getElementById('cartBtn');
if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        console.log('Cart clicked. Items:', cart);
        showNotification(`You have ${cartCount} item(s) in your cart`, 'info');
    });
}

// Home Button Click
const homeBtn = document.getElementById('homeBtn');
// Logo Click - Also redirect to home
const logo = document.getElementById('logo');
if (logo) {
    logo.style.cursor = 'pointer';
}

// Location Modal
function createLocationModal() {
    const modal = document.createElement('div');
    modal.className = 'location-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Choose your location</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Delivery options and delivery speeds may vary for different locations</p>
                <div class="location-input-group">
                    <input type="text" id="pincodeInput" placeholder="Enter 6-digit pincode" maxlength="6">
                    <button id="applyPincode" class="apply-btn">Apply</button>
                </div>
                <div id="locationResult" class="location-result"></div>
                <div id="locationError" class="location-error"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Apply pincode
    const pincodeInput = modal.querySelector('#pincodeInput');
    const applyBtn = modal.querySelector('#applyPincode');
    const locationResult = modal.querySelector('#locationResult');
    const locationError = modal.querySelector('#locationError');

    let currentLocationData = null;

    // Real-time pincode validation and fetching
    pincodeInput.addEventListener('input', async (e) => {
        const pincode = e.target.value.trim();
        locationResult.innerHTML = '';
        locationError.innerHTML = '';

        if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
            // Show loading
            locationResult.innerHTML = '<div class="location-loading"><i class="fas fa-spinner fa-spin"></i> Fetching location...</div>';

            try {
                const locationData = await fetchLocationFromPincode(pincode);

                if (locationData.success) {
                    currentLocationData = locationData;
                    locationResult.innerHTML = `
                        <div class="location-found">
                            <i class="fas fa-check-circle"></i>
                            <div class="location-details">
                                <strong>${locationData.city}, ${locationData.state}</strong>
                                <span>${locationData.district} - ${pincode}</span>
                            </div>
                        </div>
                    `;
                    applyBtn.disabled = false;
                } else {
                    locationError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid pincode. Please check and try again.';
                    currentLocationData = null;
                    applyBtn.disabled = true;
                }
            } catch (error) {
                locationError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Unable to fetch location. Please try again.';
                currentLocationData = null;
                applyBtn.disabled = true;
            }
        } else if (pincode.length > 0) {
            applyBtn.disabled = true;
        }
    });

    applyBtn.addEventListener('click', () => {
        const pincode = pincodeInput.value.trim();

        if (pincode && /^\d{6}$/.test(pincode) && currentLocationData) {
            updateLocation(pincode, currentLocationData);
            closeModal();
        } else if (!currentLocationData) {
            locationError.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid pincode';
        }
    });

    // Enter key support
    pincodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyBtn.click();
        }
    });

    // Focus input
    setTimeout(() => pincodeInput.focus(), 100);
}

// Fetch location from pincode using India Post API
async function fetchLocationFromPincode(pincode) {
    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            return {
                success: true,
                pincode: pincode,
                city: postOffice.District || postOffice.Name,
                state: postOffice.State,
                district: postOffice.District,
                country: postOffice.Country
            };
        } else {
            return { success: false };
        }
    } catch (error) {
        console.error('Error fetching pincode data:', error);
        return { success: false };
    }
}

function updateLocation(pincode, locationData) {
    const locationText = locationData ? `${locationData.city} ${pincode}` : `${pincode}`;
    const deliverLocation = document.querySelector('.deliver-location');
    if (deliverLocation) {
        deliverLocation.textContent = locationText;
    }

    // Save to localStorage
    localStorage.setItem('hvep_location', pincode);
    localStorage.setItem('hvep_location_data', JSON.stringify(locationData));

    showNotification(`Location updated to ${locationData.city}!`, 'success');
}

// Deliver To Click
const deliverTo = document.querySelector('.deliver-to');
if (deliverTo) {
    deliverTo.addEventListener('click', () => {
        createLocationModal();
    });
}

// Load saved location
function loadLocation() {
    const savedLocation = localStorage.getItem('hvep_location');
    const savedLocationData = localStorage.getItem('hvep_location_data');
    const deliverLocation = document.querySelector('.deliver-location');

    if (!deliverLocation) return;

    if (savedLocation && savedLocationData) {
        try {
            const locationData = JSON.parse(savedLocationData);
            deliverLocation.textContent = `${locationData.city} ${savedLocation}`;
        } catch (e) {
            deliverLocation.textContent = `${savedLocation}`;
        }
    } else if (savedLocation) {
        deliverLocation.textContent = `${savedLocation}`;
    }
}

// --- Google Translate Initialization ---
window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
};

// Programmatic trigger helper with cookie fallback
function triggerGoogleTranslate(langCode) {
    const isEnglish = langCode === 'en';
    
    // 1. Manage cookies: Set to /en/en for English to force restoration
    const cookieValue = isEnglish ? `/en/en` : `/en/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${location.hostname}`;
    
    // 2. Try programmatic trigger on the combo box
    let retries = 0;
    const maxRetries = 15; 

    const attempt = () => {
        const translateCombo = document.querySelector('.goog-te-combo');
        if (translateCombo) {
            translateCombo.value = langCode;
            translateCombo.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
        return false;
    };

    if (!attempt()) {
        const interval = setInterval(() => {
            retries++;
            if (attempt() || retries >= maxRetries) {
                clearInterval(interval);
            }
        }, 300);
    }

    // Additional restoration logic for English
    if (isEnglish) {
        try {
            const iframe = document.querySelector('.goog-te-banner-frame');
            if (iframe && iframe.contentDocument) {
                const restoreBtn = iframe.contentDocument.getElementById(':1.restore');
                if (restoreBtn) restoreBtn.click();
            }
        } catch (e) {
            // Catch cross-origin errors if frame is protected
        }
        
        // Clean up cookies after a delay
        setTimeout(() => {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${location.hostname}`;
        }, 1500);
    }
}

// Language Dropdown
function createLanguageDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'language-dropdown';
    dropdown.innerHTML = `
        <div class="dropdown-content">
            <div class="dropdown-header">
                <h4>Select Language</h4>
            </div>
            <div class="language-options">
                <button class="language-option" data-lang="EN">
                    <span class="lang-icon">🇬🇧</span>
                    <span class="lang-text">English</span>
                    <span class="lang-check">✓</span>
                </button>
                <button class="language-option" data-lang="HI">
                    <span class="lang-icon">🇮🇳</span>
                    <span class="lang-text">हिंदी (Hindi)</span>
                    <span class="lang-check">✓</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(dropdown);

    // Position dropdown relative to Language Button
    const languageBtn = document.getElementById('languageBtn');
    if (languageBtn) {
        const rect = languageBtn.getBoundingClientRect();
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        dropdownContent.style.top = rect.bottom + 'px';
        dropdownContent.style.left = rect.left + 'px';

        // Show dropdown
        setTimeout(() => {
            dropdownContent.style.opacity = '1';
            dropdownContent.style.transform = 'translateY(0)';
        }, 10);
    }

    // Highlight current language
    const currentLang = localStorage.getItem('hvep_language') || 'EN';
    const options = dropdown.querySelectorAll('.language-option');
    options.forEach(option => {
        if (option.dataset.lang === currentLang) {
            option.classList.add('active');
        }

        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            updateLanguage(lang);
            closeDropdown();
        });
    });

    // Close dropdown when clicking outside
    const closeDropdown = () => {
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        dropdownContent.style.opacity = '0';
        dropdownContent.style.transform = 'translateY(-10px)';
        setTimeout(() => dropdown.remove(), 200);
    };

    setTimeout(() => {
        document.addEventListener('click', function closeHandler(e) {
            const languageBtn = document.getElementById('languageBtn');
            if (!dropdown.contains(e.target) && !languageBtn.contains(e.target)) {
                closeDropdown();
                document.removeEventListener('click', closeHandler);
            }
        });
    }, 100);
}

function updateLanguage(lang) {
    const languageBtn = document.getElementById('languageBtn');
    if (languageBtn) {
        languageBtn.querySelector('.nav-item-title').textContent = lang;
        localStorage.setItem('hvep_language', lang);

        const langNames = { EN: 'English', HI: 'Hindi' };
        
        // Trigger Google Translate logic
        const googleLangMap = { 'EN': 'en', 'HI': 'hi' };
        triggerGoogleTranslate(googleLangMap[lang]);

        showNotification(`Language changed to ${langNames[lang]}. Refreshing...`, 'success');

        // AUTO REFRESH: Reload the page to ensure Google Translate applies the cookie correctly
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
}

// Language Item Click - Globe icon (FIXED TO USE ID)
const languageBtn = document.getElementById('languageBtn');
if (languageBtn) {
    languageBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        // Remove any existing dropdown
        const existing = document.querySelector('.language-dropdown');
        if (existing) {
            existing.remove();
            return;
        }

        createLanguageDropdown();
    });
}

// Account Menu - Redirects to login page via HTML link
const accountBtn = document.getElementById('accountBtn');
if (accountBtn) {
    accountBtn.addEventListener('click', (e) => {
        // Log click but allow the HTML anchor link to handle redirection
        console.log('Account clicked - Redirecting to Sign In');
    });
}

// Returns & Orders (Note: Original code didn't have an ID, kept index-based or generic check)
const returnsItem = document.querySelectorAll('.nav-item')[3]; 
if (returnsItem) {
    returnsItem.addEventListener('click', () => {
        showNotification('Please sign in to view orders', 'info');
    });
}

// Bottom Navigation Links
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const text = link.textContent.trim();

        console.log('Navigation clicked:', text);

        // Handle different navigation items
        if (text === 'All' || text.includes('All')) {
            showNotification('Browse all categories', 'info');
        } else if (text === "Today's Deals") {
            showNotification('Loading today\'s deals...', 'info');
        } else if (text.includes('Eco-Friendly')) {
            showNotification('Browse eco-friendly products', 'info');
        } else {
            showNotification(`Browse ${text}`, 'info');
        }
    });
});

// General Notification Function
function showNotification(message, type = 'info') {
    const colors = {
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#4a7c2c'
    };

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations and styles (STILL PRESENT)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    .cart-count {
        transition: transform 0.2s ease;
    }

    .search-input:focus {
        outline: 2px solid #8bc34a;
    }

    .nav-item:active, .nav-link:active {
        transform: scale(0.98);
    }

    /* Google Translate Hiding Widget UI */
    .goog-te-banner-frame.skiptranslate,
    .goog-te-gadget-icon,
    .goog-te-gadget-simple img { display: none !important; }
    body { top: 0px !important; }
    .goog-te-gadget { display: none !important; }
    .skiptranslate { display: none !important; }
    .goog-text-highlight { background: none !important; box-shadow: none !important; }

    /* Search Recommendations Styling */
    .search-bar { position: relative; overflow: visible !important; } /* Override overflow to show dropdown */
    .search-recommendations {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        z-index: 9999;
        max-height: 400px;
        overflow-y: auto;
    }
    .recommendation-item {
        padding: 12px 15px;
        cursor: pointer;
        color: #333;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        border-bottom: 1px solid #f0f0f0;
        transition: background 0.2s;
    }
    .recommendation-item:hover { background: #f0f7f2; }
    .recommendation-item i { color: #888; font-size: 12px; }
    .recommendation-item strong { color: #2f855a; font-weight: 700; }

    /* Location Modal */
    .location-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10001;
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
    }

    .modal-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        animation: modalSlideIn 0.3s ease;
    }

    @keyframes modalSlideIn {
        from {
            transform: translate(-50%, -60%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%);
            opacity: 1;
        }
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h3 {
        margin: 0;
        color: #2d5016;
        font-size: 20px;
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 32px;
        color: #666;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
    }

    .modal-close:hover {
        background-color: #f0f0f0;
    }

    .modal-body {
        padding: 24px;
    }

    .modal-body p {
        color: #666;
        margin-bottom: 20px;
        font-size: 14px;
    }

    .location-input-group {
        display: flex;
        gap: 10px;
        margin-bottom: 24px;
    }

    #pincodeInput {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
    }

    #pincodeInput:focus {
        outline: none;
        border-color: #4a7c2c;
    }

    .apply-btn {
        padding: 12px 24px;
        background-color: #4a7c2c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: background-color 0.2s;
    }

    .apply-btn:hover {
        background-color: #3d6724;
    }

    .popular-locations h4 {
        color: #333;
        font-size: 16px;
        margin-bottom: 12px;
    }

    .location-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .location-item {
        padding: 12px 16px;
        background-color: #f5f5f5;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        text-align: left;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
    }

    .location-item:hover {
        background-color: #e8f5e9;
        border-color: #4a7c2c;
    }

    /* Location Result */
    .location-result {
        margin-top: 16px;
        min-height: 60px;
    }

    .location-loading {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #666;
        font-size: 14px;
        padding: 12px;
        background-color: #f5f5f5;
        border-radius: 4px;
    }

    .location-loading i {
        color: #4a7c2c;
    }

    .location-found {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background-color: #e8f5e9;
        border: 1px solid #4a7c2c;
        border-radius: 4px;
    }

    .location-found i {
        color: #4a7c2c;
        font-size: 20px;
    }

    .location-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .location-details strong {
        color: #2d5016;
        font-size: 15px;
    }

    .location-details span {
        color: #666;
        font-size: 13px;
    }

    .location-error {
        margin-top: 12px;
        padding: 12px;
        background-color: #ffebee;
        border: 1px solid #f44336;
        border-radius: 4px;
        color: #c62828;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .location-error i {
        font-size: 16px;
    }

    .apply-btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }

    /* Language Dropdown */
    .language-dropdown {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
    }

    .dropdown-content {
        position: absolute;
        background: white;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 250px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.2s ease;
    }

    .dropdown-header {
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
    }

    .dropdown-header h4 {
        margin: 0;
        color: #333;
        font-size: 16px;
        font-weight: 600;
    }

    .language-options {
        padding: 8px 0;
    }

    .language-option {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border: none;
        background: white;
        cursor: pointer;
        transition: background-color 0.2s;
        gap: 12px;
    }

    .language-option:hover {
        background-color: #f5f5f5;
    }

    .lang-icon {
        font-size: 20px;
    }

    .lang-text {
        flex: 1;
        text-align: left;
        color: #333;
        font-size: 14px;
    }

    .lang-check {
        color: #4a7c2c;
        font-weight: bold;
        opacity: 0;
    }

    .language-option.active .lang-check {
        opacity: 1;
    }

    .language-option.active {
        background-color: #e8f5e9;
    }
`;
document.head.appendChild(style);

// Mobile Menu Toggle (for responsive design)
const allMenuBtn = document.querySelector('.all-menu');
if (allMenuBtn) {
    allMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('All categories menu', 'info');
    });
}

// Sticky Navbar on Scroll
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (navbar) {
        if (currentScroll <= 0) {
            navbar.style.boxShadow = 'none';
        } else {
            navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        }
    }
    lastScroll = currentScroll;
});

// Load saved language
function loadLanguage() {
    const savedLang = localStorage.getItem('hvep_language');
    const languageBtn = document.getElementById('languageBtn');
    if (savedLang && languageBtn) {
        languageBtn.querySelector('.nav-item-title').textContent = savedLang;
        
        // Apply the cookie immediately and try programmatic trigger
        const googleLangMap = { 'EN': 'en', 'HI': 'hi' };
        triggerGoogleTranslate(googleLangMap[savedLang]);
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    initCart();
    loadLocation();
    
    // Create translation container - Invisible but present in layout
    // (Google Translate sometimes ignores completely hidden elements)
    const translateDiv = document.createElement('div');
    translateDiv.id = 'google_translate_element';
    translateDiv.style.cssText = "position:absolute; top:-9999px; left:-9999px; width:1px; height:1px; overflow:hidden;";
    document.body.appendChild(translateDiv);

    // Load Google Translate script
    const script = document.createElement('script');
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(script);

    loadLanguage();
    console.log('HimVillage ePrahari Store initialized!');
});

// Example function to add products to cart
window.addProductToCart = function(productId, productName, price) {
    addToCart({
        id: productId,
        name: productName,
        price: price
    });
};

// Export functions for use in other scripts
window.hvepStore = {
    addToCart,
    cart,
    showNotification,
    updateCartDisplay
};