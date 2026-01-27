/**
 * Wishlist Manager - Handles persistence and logic for saved products
 */
const WishlistManager = {
    key: 'hp_wishlist_items',

    init() {
        // ADDED: Inject CSS to ensure toasts are fixed at the bottom and don't push the footer
        const style = document.createElement('style');
        style.innerHTML = `
            .hp-toast-container { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
            .hp-toast-item { background: #333; color: white; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: sans-serif; transition: all 0.3s ease; opacity: 0; transform: translateY(20px); pointer-events: auto; }
            .hp-toast-item.show { opacity: 1; transform: translateY(0); }
            .hp-toast-success { background: #28a745; }
            .hp-toast-info { background: #007bff; }
        `;
        document.head.appendChild(style);

        if (!localStorage.getItem(this.key)) {
            localStorage.setItem(this.key, JSON.stringify([]));
        }
    },

    getItems() {
        const items = localStorage.getItem(this.key);
        return items ? JSON.parse(items) : [];
    },

    toggleItem(product) {
        let items = this.getItems();
        const index = items.findIndex(item => item.id === product.id);

        if (index > -1) {
            // Remove if exists
            items.splice(index, 1);
            this.notify('Removed from wishlist', 'info');
        } else {
            // Add if not exists
            items.push(product);
            this.notify('Added to wishlist', 'success');
        }

        localStorage.setItem(this.key, JSON.stringify(items));
        // Dispatch custom event for UI updates across files
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { productId: product.id } }));
        return index === -1; // returns true if added
    },

    isWishlisted(productId) {
        const items = this.getItems();
        return items.some(item => item.id === productId);
    },

    notify(message, type) {
        // REPLACED: Updated window.showToast logic to ensure it removes itself from DOM
        window.showToast = function(msg, theme) {
            let container = document.querySelector('.hp-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'hp-toast-container';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `hp-toast-item hp-toast-${theme}`;
            toast.innerText = msg;
            container.appendChild(toast);

            // Trigger animation
            setTimeout(() => toast.classList.add('show'), 10);

            // Auto-remove logic
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300); // Final removal after transition
            }, 3000);
        };

        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[Wishlist] ${message}`);
        }
    }
};

// Initialize on load
WishlistManager.init();
window.WishlistManager = WishlistManager;