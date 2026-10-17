/**
 * ============================================================================
 * FoodEase - Food Billing System
 * Module: Order.js
 * 
 * Demonstrates Core OOP Concepts:
 * 1. INHERITANCE:
 *    - Base Class: Order
 *    - Derived Classes: DineInOrder, TakeawayOrder, DeliveryOrder
 * 2. POLYMORPHISM (Method Overriding):
 *    - Each derived order class overrides:
 *      * getOrderTypeBadge()
 *      * getServiceDetailsHTML()
 *      * getReceiptServiceInfo()
 * 3. FACTORY METHOD PATTERN (Abstraction):
 *    - Static Order.createOrder() constructs the appropriate subclass
 *      polymorphically depending on the user's selected order type.
 * 4. OBJECT SERIALIZATION & DESERIALIZATION:
 *    - toJSON() and static fromJSON() for seamless localStorage persistence.
 * ============================================================================
 */

/**
 * Base Class: Order
 * Encapsulates the general state and behaviors of a restaurant order.
 */
class Order {
    #orderId;
    #customer;
    #items;
    #orderType;
    #paymentMethod;
    #breakdown;
    #date;
    #status;

    /**
     * @param {string} orderId - e.g. "ORD-20261017-001"
     * @param {Customer} customer - Customer object instance
     * @param {Array<Object>} items - Serialized or CartItem list
     * @param {string} orderType - 'dine-in' | 'takeaway' | 'delivery'
     * @param {string} paymentMethod - 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card'
     * @param {Object} breakdown - Financial calculations breakdown from Billing
     * @param {string|Date} [date] - ISO string or Date
     * @param {string} [status] - 'Completed' | 'Pending' | 'Cancelled'
     */
    constructor(orderId, customer, items, orderType, paymentMethod, breakdown, date = new Date(), status = 'Completed') {
        this.#orderId = orderId;
        this.#customer = customer instanceof Customer ? customer : Customer.fromJSON(customer);
        this.#items = Array.isArray(items) ? items : [];
        this.#orderType = orderType;
        this.#paymentMethod = paymentMethod;
        this.#breakdown = breakdown;
        this.#date = date instanceof Date ? date.toISOString() : date;
        this.#status = status;
    }

    // --- ENCAPSULATION: Getters ---
    get orderId() { return this.#orderId; }
    get customer() { return this.#customer; }
    get items() { return this.#items; }
    get orderType() { return this.#orderType; }
    get paymentMethod() { return this.#paymentMethod; }
    get breakdown() { return this.#breakdown; }
    get date() { return this.#date; }
    get status() { return this.#status; }

    set status(newStatus) {
        this.#status = newStatus;
    }

    /**
     * Returns formatted Date and Time string (e.g., "17 Oct 2026, 04:30 PM")
     */
    getFormattedDateTime() {
        const d = new Date(this.#date);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    /**
     * Returns only the date portion (e.g. "17/10/2026")
     */
    getFormattedDateOnly() {
        const d = new Date(this.#date);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Returns the grand total amount
     */
    getGrandTotal() {
        return this.#breakdown?.grandTotal || 0;
    }

    // --- OOP CONCEPT: POLYMORPHISM (Base Methods to be overridden) ---

    /**
     * Polymorphic UI badge for the order type
     * Base implementation
     */
    getOrderTypeBadge() {
        return `<span class="badge badge-secondary"><i class="fa-solid fa-bell-concierge"></i> Standard Order</span>`;
    }

    /**
     * Polymorphic service details HTML snippet for tables and views
     */
    getServiceDetailsHTML() {
        return `<span>Standard Order</span>`;
    }

    /**
     * Polymorphic receipt snippet for the printed invoice
     */
    getReceiptServiceInfo() {
        return `Order Type: Standard Order`;
    }

    /**
     * Generates a clean text or HTML summary
     */
    getOrderSummary() {
        return `Order #${this.orderId} - ₹${this.getGrandTotal()} (${this.customer.name})`;
    }

    /**
     * Serializes Order for localStorage persistence
     */
    toJSON() {
        return {
            orderId: this.orderId,
            customer: this.customer.toJSON(),
            items: this.items,
            orderType: this.orderType,
            paymentMethod: this.paymentMethod,
            breakdown: this.breakdown,
            date: this.date,
            status: this.status
        };
    }

    /**
     * --- OOP DESIGN PATTERN: FACTORY METHOD ---
     * Instantiates the exact matching Polymorphic Subclass based on orderType
     * @param {Object} data 
     * @returns {DineInOrder|TakeawayOrder|DeliveryOrder|Order}
     */
    static createOrder(data) {
        const type = (data.orderType || '').toLowerCase();
        switch (type) {
            case 'dine-in':
            case 'dine in':
                return new DineInOrder(
                    data.orderId,
                    data.customer,
                    data.items,
                    data.paymentMethod,
                    data.breakdown,
                    data.date,
                    data.status,
                    data.customer?.tableNumber || data.tableNumber || '1'
                );

            case 'takeaway':
                return new TakeawayOrder(
                    data.orderId,
                    data.customer,
                    data.items,
                    data.paymentMethod,
                    data.breakdown,
                    data.date,
                    data.status,
                    data.pickupTime || 'Immediate'
                );

            case 'delivery':
                return new DeliveryOrder(
                    data.orderId,
                    data.customer,
                    data.items,
                    data.paymentMethod,
                    data.breakdown,
                    data.date,
                    data.status,
                    data.customer?.address || data.deliveryAddress || ''
                );

            default:
                return new Order(
                    data.orderId,
                    data.customer,
                    data.items,
                    data.orderType || 'Standard',
                    data.paymentMethod,
                    data.breakdown,
                    data.date,
                    data.status
                );
        }
    }
}

/**
 * ============================================================================
 * OOP CONCEPT: INHERITANCE & POLYMORPHISM
 * Derived Class: DineInOrder extends Order
 * ============================================================================
 */
class DineInOrder extends Order {
    #tableNumber;

    constructor(orderId, customer, items, paymentMethod, breakdown, date, status, tableNumber) {
        super(orderId, customer, items, 'dine-in', paymentMethod, breakdown, date, status);
        this.#tableNumber = String(tableNumber || customer?.tableNumber || 'T-1');
    }

    get tableNumber() {
        return this.#tableNumber;
    }

    // --- POLYMORPHIC OVERRIDES ---
    getOrderTypeBadge() {
        return `<span class="badge badge-dinein"><i class="fa-solid fa-chair"></i> Dine In (Table ${this.#tableNumber})</span>`;
    }

    getServiceDetailsHTML() {
        return `<span class="service-detail"><i class="fa-solid fa-utensils"></i> Table <strong>${this.#tableNumber}</strong></span>`;
    }

    getReceiptServiceInfo() {
        return `Order Type: Dine-In  |  Table No: ${this.#tableNumber}`;
    }

    toJSON() {
        const base = super.toJSON();
        base.tableNumber = this.#tableNumber;
        return base;
    }
}

/**
 * ============================================================================
 * OOP CONCEPT: INHERITANCE & POLYMORPHISM
 * Derived Class: TakeawayOrder extends Order
 * ============================================================================
 */
class TakeawayOrder extends Order {
    #pickupTime;

    constructor(orderId, customer, items, paymentMethod, breakdown, date, status, pickupTime = 'Counter Pickup') {
        super(orderId, customer, items, 'takeaway', paymentMethod, breakdown, date, status);
        this.#pickupTime = pickupTime;
    }

    get pickupTime() {
        return this.#pickupTime;
    }

    // --- POLYMORPHIC OVERRIDES ---
    getOrderTypeBadge() {
        return `<span class="badge badge-takeaway"><i class="fa-solid fa-bag-shopping"></i> Takeaway</span>`;
    }

    getServiceDetailsHTML() {
        return `<span class="service-detail"><i class="fa-solid fa-clock"></i> Pickup: <strong>${this.#pickupTime}</strong></span>`;
    }

    getReceiptServiceInfo() {
        return `Order Type: Takeaway / Parcel (Pickup at Counter)`;
    }

    toJSON() {
        const base = super.toJSON();
        base.pickupTime = this.#pickupTime;
        return base;
    }
}

/**
 * ============================================================================
 * OOP CONCEPT: INHERITANCE & POLYMORPHISM
 * Derived Class: DeliveryOrder extends Order
 * ============================================================================
 */
class DeliveryOrder extends Order {
    #deliveryAddress;

    constructor(orderId, customer, items, paymentMethod, breakdown, date, status, deliveryAddress = '') {
        super(orderId, customer, items, 'delivery', paymentMethod, breakdown, date, status);
        this.#deliveryAddress = deliveryAddress || customer?.address || 'Customer Address';
    }

    get deliveryAddress() {
        return this.#deliveryAddress;
    }

    // --- POLYMORPHIC OVERRIDES ---
    getOrderTypeBadge() {
        return `<span class="badge badge-delivery"><i class="fa-solid fa-motorcycle"></i> Delivery</span>`;
    }

    getServiceDetailsHTML() {
        const shortAddr = this.#deliveryAddress.length > 25 
            ? this.#deliveryAddress.substring(0, 25) + '...' 
            : this.#deliveryAddress;
        return `<span class="service-detail" title="${this.#deliveryAddress}"><i class="fa-solid fa-location-dot"></i> ${shortAddr}</span>`;
    }

    getReceiptServiceInfo() {
        return `Order Type: Home Delivery\nAddress: ${this.#deliveryAddress}`;
    }

    toJSON() {
        const base = super.toJSON();
        base.deliveryAddress = this.#deliveryAddress;
        return base;
    }
}

// Attach to window
if (typeof window !== 'undefined') {
    window.Order = Order;
    window.DineInOrder = DineInOrder;
    window.TakeawayOrder = TakeawayOrder;
    window.DeliveryOrder = DeliveryOrder;
}
