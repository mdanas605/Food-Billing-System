/**
 * ============================================================================
 * FoodEase - Food Billing System
 * Module: app.js
 * 
 * Main Application Controller (FoodBillingApp Class)
 * Orchestrates:
 * - OOP Domain Models (FoodItem, VegItem, NonVegItem, Cart, Customer, Billing, Order)
 * - UI View Navigation (SPA router for Dashboard, POS, Orders, Customers, Reports, Settings, OOP Guide)
 * - Live dynamic calculations & Form Validations
 * - LocalStorage Persistence & Data Synchronization
 * - Print Engine & Chart.js Visualizations
 * - Toast Notification Engine & Dark/Light Theme Manager
 * ============================================================================
 */

class FoodBillingApp {
    // --- Application State Encapsulation ---
    #cart;
    #billing;
    #foodItems = [];
    #orders = [];
    #settings = {};
    #activeCategory = 'All';
    #searchQuery = '';
    #activeView = 'dashboard';
    #selectedDiscountPercent = 0;
    #selectedOrderType = 'dine-in';
    #selectedPaymentMethod = 'Cash';
    #charts = {};

    constructor() {
        this.#cart = new Cart();
        this.#billing = new Billing(5, 0);
    }

    /**
     * Initializes the entire application upon DOM ready
     */
    init() {
        this.#loadSettings();
        this.#loadFoodItems();
        this.#loadOrders();
        this.#initTheme();
        this.#initClock();
        this.#bindGlobalEvents();
        this.#renderCategoryPills();
        this.#renderMenu();
        this.#renderCart();
        this.switchView('dashboard');

        // Check if there are no orders yet; if so, populate initial seed orders
        if (this.#orders.length === 0 && typeof getInitialSampleOrders === 'function') {
            this.#orders = getInitialSampleOrders();
            this.#saveOrders();
        }

        this.#updateDashboardMetrics();
    }

    // ========================================================================
    // PERSISTENCE & INITIALIZATION
    // ========================================================================

    #loadSettings() {
        const saved = localStorage.getItem('foodease_settings');
        if (saved) {
            try {
                this.#settings = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(saved));
            } catch (e) {
                this.#settings = Object.assign({}, DEFAULT_SETTINGS);
            }
        } else {
            this.#settings = Object.assign({}, DEFAULT_SETTINGS);
            this.#saveSettings();
        }

        // Apply settings to Billing instance
        this.#billing.setGSTRate(this.#settings.gstRate || 5);
        this.#billing.setDiscountRate(this.#settings.defaultDiscount || 0);
        this.#selectedDiscountPercent = this.#settings.defaultDiscount || 0;
    }

    #saveSettings() {
        localStorage.setItem('foodease_settings', JSON.stringify(this.#settings));
    }

    #loadFoodItems() {
        // Load initial catalogue
        this.#foodItems = [...INITIAL_FOOD_ITEMS];
    }

    #loadOrders() {
        const saved = localStorage.getItem('foodease_orders');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.#orders = parsed.map(orderData => Order.createOrder(orderData));
            } catch (e) {
                console.error("Error loading orders from localStorage:", e);
                this.#orders = [];
            }
        } else {
            this.#orders = [];
        }
    }

    #saveOrders() {
        const serialized = this.#orders.map(order => order.toJSON());
        localStorage.setItem('foodease_orders', JSON.stringify(serialized));
    }

    #initTheme() {
        const savedTheme = localStorage.getItem('foodease_theme') || this.#settings.theme || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('foodease_theme', theme);
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            if (theme === 'dark') {
                themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i> <span>Light Mode</span>';
                themeBtn.setAttribute('title', 'Switch to Light Mode');
            } else {
                themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i> <span>Dark Mode</span>';
                themeBtn.setAttribute('title', 'Switch to Dark Mode');
            }
        }
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
        this.showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
    }

    #initClock() {
        const updateClock = () => {
            const clockEl = document.getElementById('headerDateTime');
            if (clockEl) {
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
                const timeStr = now.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
                clockEl.innerHTML = `<i class="fa-regular fa-calendar-days"></i> ${dateStr} &nbsp;|&nbsp; <i class="fa-regular fa-clock"></i> ${timeStr}`;
            }
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    // ========================================================================
    // GLOBAL EVENTS & NAVIGATION
    // ========================================================================

    #bindGlobalEvents() {
        // Sidebar Navigation Links
        document.querySelectorAll('.sidebar-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                if (view) {
                    this.switchView(view);
                    // Close mobile sidebar if open
                    document.getElementById('appSidebar')?.classList.remove('open');
                    document.getElementById('sidebarBackdrop')?.classList.remove('open');
                }
            });
        });

        // Mobile Sidebar Toggle
        const sidebarToggle = document.getElementById('sidebarToggleBtn');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.getElementById('appSidebar')?.classList.toggle('open');
                sidebarBackdrop?.classList.toggle('open');
            });
        }
        if (sidebarBackdrop) {
            sidebarBackdrop.addEventListener('click', () => {
                document.getElementById('appSidebar')?.classList.remove('open');
                sidebarBackdrop.classList.remove('open');
            });
        }

        // Theme Toggle Button
        document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Global Header Search
        const headerSearch = document.getElementById('headerSearchInput');
        if (headerSearch) {
            headerSearch.addEventListener('input', (e) => {
                this.#searchQuery = e.target.value.trim().toLowerCase();
                // If not currently in POS/menu, switch to POS
                if (this.#activeView !== 'new-order') {
                    this.switchView('new-order');
                }
                const menuSearchInput = document.getElementById('menuSearchInput');
                if (menuSearchInput) menuSearchInput.value = e.target.value;
                this.#renderMenu();
            });
        }

        // Menu Search Input inside POS View
        const menuSearchInput = document.getElementById('menuSearchInput');
        if (menuSearchInput) {
            menuSearchInput.addEventListener('input', (e) => {
                this.#searchQuery = e.target.value.trim().toLowerCase();
                this.#renderMenu();
            });
        }

        // Clear Search Button
        document.getElementById('clearSearchBtn')?.addEventListener('click', () => {
            this.#searchQuery = '';
            if (menuSearchInput) menuSearchInput.value = '';
            if (headerSearch) headerSearch.value = '';
            this.#renderMenu();
        });

        // Order Type Selection Buttons
        document.querySelectorAll('.order-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.#selectedOrderType = btn.getAttribute('data-type');
                this.#handleOrderTypeChange(this.#selectedOrderType);
            });
        });

        // Payment Method Selection Radios / Cards
        document.querySelectorAll('.payment-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    this.#selectedPaymentMethod = radio.value;
                }
            });
        });

        // Discount Preset Buttons
        document.querySelectorAll('.discount-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.discount-preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const percent = parseFloat(btn.getAttribute('data-percent')) || 0;
                this.#selectedDiscountPercent = percent;
                const customDiscInput = document.getElementById('customDiscountInput');
                if (customDiscInput) customDiscInput.value = percent > 0 ? percent : '';
                this.#updateBillCalculations();
            });
        });

        // Custom Discount Input
        const customDiscInput = document.getElementById('customDiscountInput');
        if (customDiscInput) {
            customDiscInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0 && val <= 100) {
                    this.#selectedDiscountPercent = val;
                    document.querySelectorAll('.discount-preset-btn').forEach(b => b.classList.remove('active'));
                } else if (e.target.value === '') {
                    this.#selectedDiscountPercent = 0;
                }
                this.#updateBillCalculations();
            });
        }

        // Generate Bill Button
        document.getElementById('generateBillBtn')?.addEventListener('click', () => {
            this.generateBill();
        });

        // Clear Cart Button
        document.getElementById('clearCartBtn')?.addEventListener('click', () => {
            if (this.#cart.isEmpty()) return;
            if (confirm("Are you sure you want to clear all items from the cart?")) {
                this.#cart.clearCart();
                this.#renderCart();
                this.showToast("Shopping cart cleared.", "info");
            }
        });

        // Print Invoice Button (in modal)
        document.getElementById('printInvoiceBtn')?.addEventListener('click', () => {
            window.print();
        });

        // Close Invoice Modal Button
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeInvoiceModal();
            });
        });

        // Quick New Order button in invoice modal
        document.getElementById('newOrderModalBtn')?.addEventListener('click', () => {
            this.closeInvoiceModal();
            this.switchView('new-order');
        });

        // Settings Form Submit
        document.getElementById('settingsForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.#saveSettingsFromForm();
        });

        // Reset Demo Data
        document.getElementById('resetDemoDataBtn')?.addEventListener('click', () => {
            if (confirm("Reset system data to default sample orders and settings? Your custom orders will be restored to demo state.")) {
                this.#orders = getInitialSampleOrders();
                this.#saveOrders();
                this.#settings = Object.assign({}, DEFAULT_SETTINGS);
                this.#saveSettings();
                this.#loadSettings();
                this.switchView(this.#activeView);
                this.showToast("Demo data successfully restored!", "success");
            }
        });

        // Export Orders JSON
        document.getElementById('exportOrdersBtn')?.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.#orders.map(o => o.toJSON()), null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `foodease_orders_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            this.showToast("Orders exported as JSON successfully.", "success");
        });

        // Mobile Cart Toggle
        const mobileCartToggle = document.getElementById('mobileCartToggleBtn');
        const cartPanel = document.getElementById('cartSidebarPanel');
        if (mobileCartToggle && cartPanel) {
            mobileCartToggle.addEventListener('click', () => {
                cartPanel.classList.toggle('mobile-open');
            });
        }
        document.getElementById('closeMobileCartBtn')?.addEventListener('click', () => {
            cartPanel?.classList.remove('mobile-open');
        });
    }

    /**
     * Switch SPA views cleanly
     * @param {string} viewName - 'dashboard' | 'new-order' | 'orders' | 'customers' | 'reports' | 'settings' | 'oop-guide'
     */
    switchView(viewName) {
        this.#activeView = viewName;

        // Update sidebar links
        document.querySelectorAll('.sidebar-nav-link').forEach(link => {
            if (link.getAttribute('data-view') === viewName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update views visibility
        document.querySelectorAll('.view-section').forEach(viewEl => {
            if (viewEl.id === `view-${viewName}`) {
                viewEl.classList.add('active');
            } else {
                viewEl.classList.remove('active');
            }
        });

        // View specific refresh hooks
        switch (viewName) {
            case 'dashboard':
                this.#updateDashboardMetrics();
                this.#renderDashboardCharts();
                this.#renderRecentOrdersTable();
                break;
            case 'new-order':
                this.#renderMenu();
                this.#renderCart();
                break;
            case 'orders':
                this.#renderOrdersHistory();
                break;
            case 'customers':
                this.#renderCustomersView();
                break;
            case 'reports':
                this.#renderReportsView();
                break;
            case 'settings':
                this.#populateSettingsForm();
                break;
            case 'oop-guide':
                // Static interactive guide
                break;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ========================================================================
    // FOOD MENU & CATEGORIES
    // ========================================================================

    #renderCategoryPills() {
        const categories = ["All", "Burgers", "Pizza", "Indian", "Chinese", "Beverages", "Desserts"];
        const container = document.getElementById('categoryPillsContainer');
        if (!container) return;

        container.innerHTML = categories.map(cat => {
            const count = cat === 'All' 
                ? this.#foodItems.length 
                : this.#foodItems.filter(item => item.category === cat).length;
            const isActive = cat === this.#activeCategory ? 'active' : '';

            let icon = 'fa-utensils';
            if (cat === 'Burgers') icon = 'fa-burger';
            else if (cat === 'Pizza') icon = 'fa-pizza-slice';
            else if (cat === 'Indian') icon = 'fa-bowl-rice';
            else if (cat === 'Chinese') icon = 'fa-bowl-food';
            else if (cat === 'Beverages') icon = 'fa-mug-hot';
            else if (cat === 'Desserts') icon = 'fa-ice-cream';

            return `
                <button type="button" class="category-pill ${isActive}" data-category="${cat}">
                    <i class="fa-solid ${icon}"></i>
                    <span>${cat}</span>
                    <span class="category-count">${count}</span>
                </button>
            `;
        }).join('');

        // Bind click events on category pills
        container.querySelectorAll('.category-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.#activeCategory = btn.getAttribute('data-category');
                this.#renderMenu();
            });
        });
    }

    #renderMenu() {
        const grid = document.getElementById('foodMenuGrid');
        const emptyState = document.getElementById('menuEmptyState');
        const countDisplay = document.getElementById('menuItemCountDisplay');
        if (!grid) return;

        // Filter items by category and search
        let filtered = this.#foodItems;
        if (this.#activeCategory !== 'All') {
            filtered = filtered.filter(item => item.category === this.#activeCategory);
        }
        if (this.#searchQuery) {
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(this.#searchQuery) ||
                item.description.toLowerCase().includes(this.#searchQuery) ||
                item.category.toLowerCase().includes(this.#searchQuery)
            );
        }

        if (countDisplay) {
            countDisplay.innerText = `Showing ${filtered.length} items`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = filtered.map(item => {
            // Polymorphism in action: calling item.getBadgeHTML()
            const badgeHTML = item.getBadgeHTML();
            const existingCartItem = this.#cart.findItem(item.id);
            const inCartQty = existingCartItem ? existingCartItem.quantity : 0;

            return `
                <div class="food-card" data-id="${item.id}">
                    <div class="food-card-img-wrap">
                        <img src="${item.image}" alt="${item.name}" class="food-card-img" loading="lazy" onerror="this.onerror=null; this.src='images/burger.svg';">
                        <span class="food-category-tag">${item.category}</span>
                        ${badgeHTML}
                    </div>
                    <div class="food-card-body">
                        <div class="food-card-header">
                            <h3 class="food-title">${item.name}</h3>
                            <span class="food-price">${item.getFormattedPrice()}</span>
                        </div>
                        <p class="food-desc">${item.description}</p>
                        <div class="food-card-footer">
                            <span class="dietary-hint" title="${item.getTypeDetails()}">
                                <i class="fa-solid fa-circle-info"></i> ${item.type === 'veg' ? 'Pure Veg' : 'Non-Veg'}
                            </span>
                            <button type="button" class="btn btn-primary add-to-cart-btn" data-id="${item.id}">
                                <i class="fa-solid fa-plus"></i> Add ${inCartQty > 0 ? `(${inCartQty})` : ''}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Bind Add to Cart buttons
        grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                this.addToCart(id);
            });
        });
    }

    // ========================================================================
    // CART & BILLING CALCULATIONS
    // ========================================================================

    addToCart(foodItemId) {
        const foodItem = this.#foodItems.find(f => f.id === foodItemId);
        if (!foodItem) return;

        this.#cart.addItem(foodItem, 1);
        this.#renderCart();
        this.#renderMenu(); // Updates button badge
        this.showToast(`✓ "${foodItem.name}" added to cart`, 'success');
    }

    updateCartQuantity(foodItemId, delta) {
        if (delta > 0) {
            this.#cart.increaseQuantity(foodItemId);
        } else {
            this.#cart.decreaseQuantity(foodItemId, true);
        }
        this.#renderCart();
        this.#renderMenu();
    }

    removeFromCart(foodItemId) {
        const item = this.#cart.findItem(foodItemId);
        const name = item ? item.foodItem.name : 'Item';
        this.#cart.removeItem(foodItemId);
        this.#renderCart();
        this.#renderMenu();
        this.showToast(`✓ "${name}" removed from cart`, 'info');
    }

    #renderCart() {
        const container = document.getElementById('cartItemsList');
        const emptyState = document.getElementById('cartEmptyState');
        const cartContentWrap = document.getElementById('cartContentWrap');
        const badgeCount = document.getElementById('cartBadgeCount');
        const mobileBadge = document.getElementById('mobileCartBadge');

        const totalQty = this.#cart.getTotalQuantity();
        if (badgeCount) badgeCount.innerText = totalQty;
        if (mobileBadge) mobileBadge.innerText = totalQty;

        if (this.#cart.isEmpty()) {
            if (container) container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            if (cartContentWrap) cartContentWrap.style.display = 'none';
            this.#updateBillCalculations();
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (cartContentWrap) cartContentWrap.style.display = 'block';

        if (container) {
            container.innerHTML = this.#cart.getItems().map(cartItem => {
                const f = cartItem.foodItem;
                const vegIcon = f.type === 'veg' 
                    ? '<span class="diet-dot veg-dot"></span>' 
                    : '<span class="diet-triangle nonveg-triangle"></span>';

                return `
                    <div class="cart-item-row" data-id="${f.id}">
                        <div class="cart-item-info">
                            <div class="cart-item-name-wrap">
                                <span class="diet-icon-sm">${vegIcon}</span>
                                <h4 class="cart-item-name">${f.name}</h4>
                            </div>
                            <span class="cart-item-unit-price">${f.getFormattedPrice()} each</span>
                        </div>
                        <div class="cart-item-actions">
                            <div class="qty-control">
                                <button type="button" class="qty-btn qty-minus-btn" data-id="${f.id}" title="Decrease quantity">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <span class="qty-number">${cartItem.quantity}</span>
                                <button type="button" class="qty-btn qty-plus-btn" data-id="${f.id}" title="Increase quantity">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                            <span class="cart-item-subtotal">${cartItem.getFormattedSubtotal()}</span>
                            <button type="button" class="cart-item-remove-btn" data-id="${f.id}" title="Remove item">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            // Bind actions
            container.querySelectorAll('.qty-minus-btn').forEach(b => {
                b.addEventListener('click', () => this.updateCartQuantity(b.getAttribute('data-id'), -1));
            });
            container.querySelectorAll('.qty-plus-btn').forEach(b => {
                b.addEventListener('click', () => this.updateCartQuantity(b.getAttribute('data-id'), 1));
            });
            container.querySelectorAll('.cart-item-remove-btn').forEach(b => {
                b.addEventListener('click', () => this.removeFromCart(b.getAttribute('data-id')));
            });
        }

        this.#updateBillCalculations();
    }

    #handleOrderTypeChange(orderType) {
        const tableGroup = document.getElementById('tableNumberGroup');
        const deliveryGroup = document.getElementById('deliveryAddressGroup');
        const deliveryFeeRow = document.getElementById('deliveryFeeRow');

        if (orderType === 'dine-in') {
            if (tableGroup) tableGroup.style.display = 'block';
            if (deliveryGroup) deliveryGroup.style.display = 'none';
            if (deliveryFeeRow) deliveryFeeRow.style.display = 'none';
        } else if (orderType === 'takeaway') {
            if (tableGroup) tableGroup.style.display = 'none';
            if (deliveryGroup) deliveryGroup.style.display = 'none';
            if (deliveryFeeRow) deliveryFeeRow.style.display = 'none';
        } else if (orderType === 'delivery') {
            if (tableGroup) tableGroup.style.display = 'none';
            if (deliveryGroup) deliveryGroup.style.display = 'block';
            if (deliveryFeeRow) deliveryFeeRow.style.display = 'flex';
        }

        this.#updateBillCalculations();
    }

    #updateBillCalculations() {
        const subtotal = this.#cart.calculateSubtotal();
        const deliveryFee = this.#selectedOrderType === 'delivery' ? 40 : 0;

        // Perform calculation using Billing instance
        const breakdown = this.#billing.calculateBreakdown(subtotal, this.#selectedDiscountPercent, deliveryFee);

        // Update DOM displays
        const subtotalEl = document.getElementById('billSubtotal');
        const discountEl = document.getElementById('billDiscount');
        const discountRow = document.getElementById('discountRow');
        const gstLabel = document.getElementById('gstLabel');
        const gstEl = document.getElementById('billGST');
        const deliveryFeeEl = document.getElementById('billDeliveryFee');
        const grandTotalEl = document.getElementById('billGrandTotal');

        if (subtotalEl) subtotalEl.innerText = breakdown.formatted.subtotal;

        if (discountEl) {
            discountEl.innerText = breakdown.discountAmount > 0 
                ? breakdown.formatted.discountAmount 
                : '₹0.00';
        }
        if (discountRow) {
            discountRow.style.display = breakdown.discountAmount > 0 ? 'flex' : 'none';
        }

        if (gstLabel) {
            gstLabel.innerText = `GST (${breakdown.gstPercent}%)`;
        }
        if (gstEl) {
            gstEl.innerText = breakdown.formatted.totalGst;
        }

        if (deliveryFeeEl) {
            deliveryFeeEl.innerText = breakdown.formatted.deliveryFee;
        }

        if (grandTotalEl) {
            grandTotalEl.innerText = breakdown.formatted.grandTotal;
        }

        return breakdown;
    }

    // ========================================================================
    // ORDER GENERATION & INVOICE
    // ========================================================================

    generateBill() {
        // 1. Validate Cart
        if (this.#cart.isEmpty()) {
            this.showToast("Cannot generate bill: Cart is empty!", "error");
            return;
        }

        // 2. Extract Customer Form Values
        const nameInput = document.getElementById('custNameInput');
        const phoneInput = document.getElementById('custPhoneInput');
        const emailInput = document.getElementById('custEmailInput');
        const tableInput = document.getElementById('custTableInput');
        const addressInput = document.getElementById('custAddressInput');

        const customer = new Customer(
            nameInput ? nameInput.value : '',
            phoneInput ? phoneInput.value : '',
            emailInput ? emailInput.value : '',
            tableInput ? tableInput.value : '',
            addressInput ? addressInput.value : ''
        );

        // 3. Validate Customer Details via Customer class encapsulation
        const validation = customer.validate(this.#selectedOrderType);
        this.#clearValidationErrors();

        if (!validation.isValid) {
            this.#displayValidationErrors(validation.errors);
            this.showToast("Please fix the errors in customer details.", "error");
            return;
        }

        // 4. Calculate Final Financials
        const deliveryFee = this.#selectedOrderType === 'delivery' ? 40 : 0;
        const breakdown = this.#billing.calculateBreakdown(
            this.#cart.calculateSubtotal(),
            this.#selectedDiscountPercent,
            deliveryFee
        );

        // 5. Generate Unique Order ID
        const now = new Date();
        const datePart = now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0');
        const sequence = String(this.#orders.length + 1).padStart(3, '0');
        const orderId = `ORD-${datePart}-${sequence}`;

        // 6. Instantiate Subclass using Factory Pattern (OOP Design Pattern)
        const orderData = {
            orderId: orderId,
            customer: customer,
            items: this.#cart.toJSON(),
            orderType: this.#selectedOrderType,
            tableNumber: customer.tableNumber,
            deliveryAddress: customer.address,
            paymentMethod: this.#selectedPaymentMethod,
            breakdown: breakdown,
            date: now,
            status: "Completed"
        };

        const newOrder = Order.createOrder(orderData);

        // 7. Persist Order
        this.#orders.unshift(newOrder);
        this.#saveOrders();

        // 8. Display Invoice Modal
        this.displayInvoice(newOrder);

        // 9. Reset Cart and Form
        this.#cart.clearCart();
        this.#renderCart();
        this.#renderMenu();
        this.#resetCustomerForm();

        this.showToast(`✓ Order #${orderId} generated successfully!`, "success");
    }

    #displayValidationErrors(errors) {
        if (errors.name) {
            const el = document.getElementById('nameError');
            if (el) el.innerText = errors.name;
            document.getElementById('custNameInput')?.classList.add('is-invalid');
        }
        if (errors.phone) {
            const el = document.getElementById('phoneError');
            if (el) el.innerText = errors.phone;
            document.getElementById('custPhoneInput')?.classList.add('is-invalid');
        }
        if (errors.email) {
            const el = document.getElementById('emailError');
            if (el) el.innerText = errors.email;
            document.getElementById('custEmailInput')?.classList.add('is-invalid');
        }
        if (errors.tableNumber) {
            const el = document.getElementById('tableError');
            if (el) el.innerText = errors.tableNumber;
            document.getElementById('custTableInput')?.classList.add('is-invalid');
        }
        if (errors.address) {
            const el = document.getElementById('addressError');
            if (el) el.innerText = errors.address;
            document.getElementById('custAddressInput')?.classList.add('is-invalid');
        }
    }

    #clearValidationErrors() {
        document.querySelectorAll('.form-error-msg').forEach(el => el.innerText = '');
        document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
    }

    #resetCustomerForm() {
        const nameInput = document.getElementById('custNameInput');
        const phoneInput = document.getElementById('custPhoneInput');
        const emailInput = document.getElementById('custEmailInput');
        const tableInput = document.getElementById('custTableInput');
        const addressInput = document.getElementById('custAddressInput');

        if (nameInput) nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (emailInput) emailInput.value = '';
        if (tableInput) tableInput.value = '';
        if (addressInput) addressInput.value = '';

        this.#clearValidationErrors();
    }

    /**
     * Renders and opens the Invoice Modal with printable receipt styling
     * @param {Order} order 
     */
    displayInvoice(order) {
        const modal = document.getElementById('invoiceModal');
        const receiptContainer = document.getElementById('receiptPrintArea');
        if (!modal || !receiptContainer) return;

        const breakdown = order.breakdown;
        const customer = order.customer;

        // Build item rows
        const itemRows = order.items.map(item => `
            <tr>
                <td class="col-item">
                    <span class="receipt-item-name">${item.foodItem.name}</span>
                    <span class="receipt-item-meta">${item.foodItem.category}</span>
                </td>
                <td class="col-qty text-center">${item.quantity}</td>
                <td class="col-rate text-right">₹${Number(item.foodItem.price).toFixed(2)}</td>
                <td class="col-amt text-right">₹${Number(item.subtotal).toFixed(2)}</td>
            </tr>
        `).join('');

        // Polymorphic service detail from Order subclass
        const serviceReceiptInfo = order.getReceiptServiceInfo();

        receiptContainer.innerHTML = `
            <div class="thermal-receipt">
                <!-- Receipt Header -->
                <div class="receipt-header text-center">
                    <div class="receipt-logo">🍴 ${this.#settings.restaurantName}</div>
                    <div class="receipt-tagline">${this.#settings.subtitle}</div>
                    <div class="receipt-meta">${this.#settings.address}</div>
                    <div class="receipt-meta">Ph: ${this.#settings.phone} | GSTIN: ${this.#settings.gstin}</div>
                    <div class="receipt-divider-double"></div>
                    <div class="receipt-title">TAX INVOICE / CASH BILL</div>
                    <div class="receipt-divider"></div>
                </div>

                <!-- Order Meta Details -->
                <div class="receipt-info-grid">
                    <div><strong>Order ID:</strong> ${order.orderId}</div>
                    <div class="text-right"><strong>Date:</strong> ${order.getFormattedDateOnly()}</div>
                    <div><strong>Customer:</strong> ${customer.name}</div>
                    <div class="text-right"><strong>Time:</strong> ${new Date(order.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    <div><strong>Phone:</strong> ${customer.phone}</div>
                    <div class="text-right"><strong>Status:</strong> ${order.status}</div>
                    <div class="col-span-2 receipt-service-box">
                        <i class="fa-solid fa-receipt"></i> ${serviceReceiptInfo}
                    </div>
                </div>

                <div class="receipt-divider"></div>

                <!-- Items Table -->
                <table class="receipt-table">
                    <thead>
                        <tr>
                            <th class="col-item">Item</th>
                            <th class="col-qty text-center">Qty</th>
                            <th class="col-rate text-right">Rate</th>
                            <th class="col-amt text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRows}
                    </tbody>
                </table>

                <div class="receipt-divider"></div>

                <!-- Financial Calculations Breakdown -->
                <div class="receipt-totals">
                    <div class="totals-row">
                        <span>Subtotal</span>
                        <span>${breakdown.formatted.subtotal}</span>
                    </div>

                    ${breakdown.discountAmount > 0 ? `
                        <div class="totals-row discount-text">
                            <span>Discount (${breakdown.discountPercent}%)</span>
                            <span>${breakdown.formatted.discountAmount}</span>
                        </div>
                    ` : ''}

                    <div class="totals-row">
                        <span>Taxable Amount</span>
                        <span>${breakdown.formatted.taxableAmount}</span>
                    </div>

                    <div class="totals-row tax-row">
                        <span>CGST (${breakdown.cgstPercent}%)</span>
                        <span>${breakdown.formatted.cgstAmount}</span>
                    </div>

                    <div class="totals-row tax-row">
                        <span>SGST (${breakdown.sgstPercent}%)</span>
                        <span>${breakdown.formatted.sgstAmount}</span>
                    </div>

                    ${breakdown.deliveryFee > 0 ? `
                        <div class="totals-row">
                            <span>Delivery Charges</span>
                            <span>${breakdown.formatted.deliveryFee}</span>
                        </div>
                    ` : ''}

                    <div class="receipt-divider"></div>

                    <div class="totals-row grand-total-row">
                        <span>GRAND TOTAL</span>
                        <span>${breakdown.formatted.grandTotal}</span>
                    </div>
                </div>

                <div class="receipt-divider-double"></div>

                <!-- Payment Details -->
                <div class="receipt-payment-box text-center">
                    <span class="payment-stamp">PAID via ${order.paymentMethod.toUpperCase()}</span>
                </div>

                <!-- Footer & Thank You -->
                <div class="receipt-footer text-center">
                    <div class="thank-you-msg">Thank You! Visit Again 😊</div>
                    <div class="powered-by">FoodEase Smart POS System • Computer Generated Bill</div>
                </div>
            </div>
        `;

        modal.classList.add('open');
    }

    closeInvoiceModal() {
        document.getElementById('invoiceModal')?.classList.remove('open');
    }

    // ========================================================================
    // DASHBOARD & CHARTS
    // ========================================================================

    #updateDashboardMetrics() {
        const totalOrders = this.#orders.length;
        
        // Today's Sales Calculation
        const todayStr = new Date().toDateString();
        const todayOrders = this.#orders.filter(o => new Date(o.date).toDateString() === todayStr);
        const todaySales = todayOrders.reduce((sum, o) => sum + o.getGrandTotal(), 0);

        // Total unique customers
        const uniquePhones = new Set(this.#orders.map(o => o.customer.phone).filter(Boolean));
        const totalCustomers = uniquePhones.size || todayOrders.length;

        // Pending / Active orders
        const pendingOrders = this.#orders.filter(o => o.status === 'Pending').length;

        // DOM elements update
        const elTotalOrders = document.getElementById('dashTotalOrders');
        const elTodaySales = document.getElementById('dashTodaySales');
        const elTotalCust = document.getElementById('dashTotalCustomers');
        const elPending = document.getElementById('dashPendingOrders');

        if (elTotalOrders) elTotalOrders.innerText = totalOrders;
        if (elTodaySales) elTodaySales.innerText = `₹${todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        if (elTotalCust) elTotalCust.innerText = totalCustomers;
        if (elPending) elPending.innerText = pendingOrders;

        // Quick mini-stats
        const avgOrderVal = totalOrders > 0 ? Math.round((this.#orders.reduce((s, o) => s + o.getGrandTotal(), 0) / totalOrders)) : 0;
        const avgEl = document.getElementById('dashAvgOrderVal');
        if (avgEl) avgEl.innerText = `₹${avgOrderVal}`;
    }

    #renderDashboardCharts() {
        // Destroy old instances to prevent Chart.js reuse errors
        if (this.#charts.salesOverview) this.#charts.salesOverview.destroy();
        if (this.#charts.categoryDonut) this.#charts.categoryDonut.destroy();

        const salesCanvas = document.getElementById('dashboardSalesChart');
        const categoryCanvas = document.getElementById('dashboardCategoryChart');

        // Prepare weekly sales data
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];
        const dayAmounts = [0, 0, 0, 0, 0, 0, 0];

        this.#orders.forEach(order => {
            const d = new Date(order.date);
            const dayIdx = d.getDay();
            dayAmounts[dayIdx] += order.getGrandTotal();
            dayCounts[dayIdx] += 1;
        });

        // Reorder days starting from Monday
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dataSales = [
            dayAmounts[1], dayAmounts[2], dayAmounts[3],
            dayAmounts[4], dayAmounts[5], dayAmounts[6], dayAmounts[0]
        ];

        if (salesCanvas && window.Chart) {
            this.#charts.salesOverview = new Chart(salesCanvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Sales Revenue (₹)',
                        data: dataSales,
                        backgroundColor: 'rgba(235, 94, 40, 0.85)',
                        borderColor: '#eb5e28',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: val => '₹' + val
                            }
                        }
                    }
                }
            });
        }

        // Category popularity counts
        const catMap = {};
        this.#orders.forEach(order => {
            order.items.forEach(item => {
                const cat = item.foodItem.category || 'Other';
                catMap[cat] = (catMap[cat] || 0) + item.quantity;
            });
        });

        const catLabels = Object.keys(catMap);
        const catValues = Object.values(catMap);

        if (categoryCanvas && window.Chart && catLabels.length > 0) {
            this.#charts.categoryDonut = new Chart(categoryCanvas, {
                type: 'doughnut',
                data: {
                    labels: catLabels,
                    datasets: [{
                        data: catValues,
                        backgroundColor: [
                            '#eb5e28', '#25a244', '#2a9d8f', '#e76f51', '#f4a261', '#457b9d', '#9b5de5'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    }

    #renderRecentOrdersTable() {
        const tbody = document.getElementById('dashboardRecentOrdersTbody');
        if (!tbody) return;

        const recent = this.#orders.slice(0, 5);
        if (recent.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No orders found. Generate your first bill!</td></tr>`;
            return;
        }

        tbody.innerHTML = recent.map(order => `
            <tr>
                <td><strong>${order.orderId}</strong></td>
                <td>${order.customer.name}</td>
                <td>${order.getFormattedDateOnly()}</td>
                <td><strong>₹${order.getGrandTotal().toFixed(2)}</strong></td>
                <td><span class="payment-pill">${order.paymentMethod}</span></td>
                <td>${order.getOrderTypeBadge()}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-primary view-recent-order-btn" data-id="${order.orderId}">
                        <i class="fa-solid fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.view-recent-order-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const ord = this.#orders.find(o => o.orderId === id);
                if (ord) this.displayInvoice(ord);
            });
        });
    }

    // ========================================================================
    // ORDERS HISTORY VIEW
    // ========================================================================

    #renderOrdersHistory() {
        const tbody = document.getElementById('ordersTableTbody');
        const emptyState = document.getElementById('ordersEmptyState');
        const countBadge = document.getElementById('totalOrdersCountBadge');
        if (!tbody) return;

        if (countBadge) countBadge.innerText = `${this.#orders.length} Orders`;

        if (this.#orders.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        tbody.innerHTML = this.#orders.map(order => `
            <tr data-order-id="${order.orderId}">
                <td><strong>${order.orderId}</strong></td>
                <td>
                    <div class="customer-cell">
                        <strong>${order.customer.name}</strong>
                        <span class="customer-cell-phone">${order.customer.phone}</span>
                    </div>
                </td>
                <td>${order.getFormattedDateTime()}</td>
                <td>${order.getOrderTypeBadge()}</td>
                <td>${order.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                <td><strong>₹${order.getGrandTotal().toFixed(2)}</strong></td>
                <td><span class="payment-pill">${order.paymentMethod}</span></td>
                <td><span class="badge badge-success">${order.status}</span></td>
                <td>
                    <div class="action-btn-group">
                        <button type="button" class="btn btn-sm btn-outline-primary action-view-order-btn" data-id="${order.orderId}" title="View Invoice">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary action-print-order-btn" data-id="${order.orderId}" title="Print Invoice">
                            <i class="fa-solid fa-print"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger action-delete-order-btn" data-id="${order.orderId}" title="Delete Order">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Action bindings
        tbody.querySelectorAll('.action-view-order-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const order = this.#orders.find(o => o.orderId === id);
                if (order) this.displayInvoice(order);
            });
        });

        tbody.querySelectorAll('.action-print-order-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const order = this.#orders.find(o => o.orderId === id);
                if (order) {
                    this.displayInvoice(order);
                    setTimeout(() => window.print(), 300);
                }
            });
        });

        tbody.querySelectorAll('.action-delete-order-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm(`Are you sure you want to delete order ${id}?`)) {
                    this.#orders = this.#orders.filter(o => o.orderId !== id);
                    this.#saveOrders();
                    this.#renderOrdersHistory();
                    this.#updateDashboardMetrics();
                    this.showToast(`Order ${id} deleted.`, 'info');
                }
            });
        });

        // Filter / Search inside Orders Table
        const orderSearchInput = document.getElementById('orderFilterSearchInput');
        if (orderSearchInput && !orderSearchInput.dataset.bound) {
            orderSearchInput.dataset.bound = "true";
            orderSearchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const rows = tbody.querySelectorAll('tr');
                rows.forEach(r => {
                    const text = r.innerText.toLowerCase();
                    r.style.display = text.includes(query) ? '' : 'none';
                });
            });
        }
    }

    // ========================================================================
    // CUSTOMERS DIRECTORY VIEW
    // ========================================================================

    #renderCustomersView() {
        const tbody = document.getElementById('customersTableTbody');
        const totalCustBadge = document.getElementById('customersCountBadge');
        if (!tbody) return;

        // Group customer records by phone number
        const customerMap = new Map();

        this.#orders.forEach(order => {
            const phone = order.customer.phone || order.customer.name;
            if (!customerMap.has(phone)) {
                customerMap.set(phone, {
                    name: order.customer.name,
                    phone: order.customer.phone,
                    email: order.customer.email,
                    orderCount: 0,
                    totalSpent: 0,
                    lastOrderDate: order.date
                });
            }
            const record = customerMap.get(phone);
            record.orderCount += 1;
            record.totalSpent += order.getGrandTotal();
            if (new Date(order.date) > new Date(record.lastOrderDate)) {
                record.lastOrderDate = order.date;
            }
        });

        const list = Array.from(customerMap.values());
        if (totalCustBadge) totalCustBadge.innerText = `${list.length} Customers`;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No customer records found yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map((c, idx) => `
            <tr>
                <td><strong>#${idx + 1}</strong></td>
                <td>
                    <div class="customer-cell">
                        <strong>${c.name}</strong>
                    </div>
                </td>
                <td><i class="fa-solid fa-phone text-muted"></i> ${c.phone || 'N/A'}</td>
                <td><i class="fa-regular fa-envelope text-muted"></i> ${c.email || 'N/A'}</td>
                <td><span class="badge badge-info">${c.orderCount} Orders</span></td>
                <td><strong>₹${c.totalSpent.toFixed(2)}</strong></td>
            </tr>
        `).join('');
    }

    // ========================================================================
    // REPORTS & ANALYTICS VIEW
    // ========================================================================

    #renderReportsView() {
        const totalRev = this.#orders.reduce((s, o) => s + o.getGrandTotal(), 0);
        const totalOrders = this.#orders.length;
        const avgOrder = totalOrders > 0 ? (totalRev / totalOrders) : 0;
        const totalGst = this.#orders.reduce((s, o) => s + (o.breakdown?.totalGst || 0), 0);

        document.getElementById('repTotalRevenue')?.replaceChildren(document.createTextNode(`₹${totalRev.toFixed(2)}`));
        document.getElementById('repTotalOrders')?.replaceChildren(document.createTextNode(totalOrders));
        document.getElementById('repAvgOrderValue')?.replaceChildren(document.createTextNode(`₹${avgOrder.toFixed(2)}`));
        document.getElementById('repTotalGST')?.replaceChildren(document.createTextNode(`₹${totalGst.toFixed(2)}`));

        // Render Report Charts
        if (this.#charts.repPaymentChart) this.#charts.repPaymentChart.destroy();
        if (this.#charts.repOrderTypeChart) this.#charts.repOrderTypeChart.destroy();

        // Payment distribution
        const payMap = { Cash: 0, UPI: 0, 'Credit Card': 0, 'Debit Card': 0 };
        this.#orders.forEach(o => {
            payMap[o.paymentMethod] = (payMap[o.paymentMethod] || 0) + 1;
        });

        const payCanvas = document.getElementById('reportPaymentChart');
        if (payCanvas && window.Chart) {
            this.#charts.repPaymentChart = new Chart(payCanvas, {
                type: 'pie',
                data: {
                    labels: Object.keys(payMap),
                    datasets: [{
                        data: Object.values(payMap),
                        backgroundColor: ['#2a9d8f', '#eb5e28', '#457b9d', '#e76f51']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Order Type distribution
        const typeMap = { 'Dine In': 0, 'Takeaway': 0, 'Delivery': 0 };
        this.#orders.forEach(o => {
            const t = (o.orderType || '').toLowerCase();
            if (t.includes('dine')) typeMap['Dine In'] += 1;
            else if (t.includes('takeaway')) typeMap['Takeaway'] += 1;
            else if (t.includes('delivery')) typeMap['Delivery'] += 1;
        });

        const typeCanvas = document.getElementById('reportOrderTypeChart');
        if (typeCanvas && window.Chart) {
            this.#charts.repOrderTypeChart = new Chart(typeCanvas, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(typeMap),
                    datasets: [{
                        data: Object.values(typeMap),
                        backgroundColor: ['#f4a261', '#25a244', '#9b5de5']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Top 5 Best Selling Food Items
        const itemSales = {};
        this.#orders.forEach(o => {
            o.items.forEach(i => {
                const name = i.foodItem.name;
                if (!itemSales[name]) itemSales[name] = { count: 0, revenue: 0 };
                itemSales[name].count += i.quantity;
                itemSales[name].revenue += i.subtotal;
            });
        });

        const sortedItems = Object.entries(itemSales)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);

        const topItemsTbody = document.getElementById('reportTopItemsTbody');
        if (topItemsTbody) {
            if (sortedItems.length === 0) {
                topItemsTbody.innerHTML = `<tr><td colspan="4" class="text-center py-3 text-muted">No sales data recorded yet.</td></tr>`;
            } else {
                topItemsTbody.innerHTML = sortedItems.map(([name, data], idx) => `
                    <tr>
                        <td><strong>#${idx + 1}</strong></td>
                        <td><strong>${name}</strong></td>
                        <td><span class="badge badge-primary">${data.count} portions</span></td>
                        <td><strong>₹${data.revenue.toFixed(2)}</strong></td>
                    </tr>
                `).join('');
            }
        }
    }

    // ========================================================================
    // SETTINGS VIEW
    // ========================================================================

    #populateSettingsForm() {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };

        setVal('settingRestName', this.#settings.restaurantName || '');
        setVal('settingSubtitle', this.#settings.subtitle || '');
        setVal('settingAddress', this.#settings.address || '');
        setVal('settingPhone', this.#settings.phone || '');
        setVal('settingEmail', this.#settings.email || '');
        setVal('settingGSTIN', this.#settings.gstin || '');
        setVal('settingGSTRate', this.#settings.gstRate || 5);
        setVal('settingDefaultDiscount', this.#settings.defaultDiscount || 0);
    }

    #saveSettingsFromForm() {
        const getVal = id => document.getElementById(id)?.value?.trim() || '';

        this.#settings.restaurantName = getVal('settingRestName') || 'FoodEase';
        this.#settings.subtitle = getVal('settingSubtitle') || 'Smart Restaurant Billing & Order Management';
        this.#settings.address = getVal('settingAddress');
        this.#settings.phone = getVal('settingPhone');
        this.#settings.email = getVal('settingEmail');
        this.#settings.gstin = getVal('settingGSTIN');

        const gstRate = parseFloat(getVal('settingGSTRate')) || 5;
        this.#settings.gstRate = gstRate;
        this.#billing.setGSTRate(gstRate);

        const defDisc = parseFloat(getVal('settingDefaultDiscount')) || 0;
        this.#settings.defaultDiscount = defDisc;
        this.#billing.setDiscountRate(defDisc);

        this.#saveSettings();
        this.#updateBillCalculations();
        this.showToast("Settings updated successfully!", "success");
    }

    // ========================================================================
    // TOAST NOTIFICATIONS
    // ========================================================================

    /**
     * Show non-intrusive toast notification
     * @param {string} message 
     * @param {'success'|'info'|'warning'|'error'} type 
     * @param {number} durationMs 
     */
    showToast(message, type = 'info', durationMs = 3200) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let icon = 'fa-circle-info';
        if (type === 'success') icon = 'fa-circle-check';
        else if (type === 'warning') icon = 'fa-triangle-exclamation';
        else if (type === 'error') icon = 'fa-circle-xmark';

        toast.innerHTML = `
            <i class="fa-solid ${icon} toast-icon"></i>
            <span class="toast-message">${message}</span>
            <button type="button" class="toast-close-btn">&times;</button>
        `;

        toast.querySelector('.toast-close-btn').addEventListener('click', () => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 250);
        });

        container.appendChild(toast);

        // Auto trigger display animation
        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                toast.classList.add('hide');
                setTimeout(() => toast.remove(), 250);
            }
        }, durationMs);
    }
}

// Instantiate and initialize on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    window.app = new FoodBillingApp();
    window.app.init();
});
