/**
 * ============================================================================
 * FoodEase - Food Billing System
 * Module: Cart.js
 * 
 * Demonstrates Core OOP Concepts:
 * 1. COMPOSITION & AGGREGATION: Cart contains a collection of CartItem objects;
 *    CartItem has a reference to a FoodItem object.
 * 2. ENCAPSULATION: Cart maintains a private #items array. Direct outside
 *    mutation of the cart items array is disallowed; mutations occur strictly
 *    via public methods (addItem, removeItem, increaseQuantity, etc.).
 * 3. SINGLE RESPONSIBILITY PRINCIPLE (SRP):
 *    - CartItem manages quantity and single-line subtotals.
 *    - Cart coordinates the active order items and aggregated subtotals.
 * ============================================================================
 */

/**
 * Class: CartItem
 * Represents a single line item in the shopping cart.
 */
class CartItem {
    #quantity;

    /**
     * @param {FoodItem} foodItem - The food item instance
     * @param {number} quantity - Initial quantity (default 1)
     */
    constructor(foodItem, quantity = 1) {
        if (!foodItem || !(foodItem instanceof FoodItem)) {
            throw new Error("[CartItem] Invalid foodItem supplied to CartItem constructor.");
        }
        this.foodItem = foodItem;
        this.#quantity = Math.max(1, parseInt(quantity, 10) || 1);
    }

    // --- ENCAPSULATION: Quantity Getter & Setter with bounds validation ---
    get quantity() {
        return this.#quantity;
    }

    set quantity(value) {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 1) {
            throw new Error("[CartItem] Quantity must be an integer >= 1.");
        }
        this.#quantity = parsed;
    }

    /**
     * Increments the quantity by 1
     */
    increase() {
        this.#quantity += 1;
        return this.#quantity;
    }

    /**
     * Decrements the quantity by 1 (minimum 1)
     */
    decrease() {
        if (this.#quantity > 1) {
            this.#quantity -= 1;
            return true;
        }
        return false; // Signals caller that quantity reached minimum bound
    }

    /**
     * Calculates the line-item subtotal
     * Subtotal = unit price * quantity
     * @returns {number}
     */
    getSubtotal() {
        return Math.round(this.foodItem.price * this.#quantity * 100) / 100;
    }

    /**
     * Formats subtotal for display
     * @returns {string} e.g. "₹300.00"
     */
    getFormattedSubtotal() {
        return `₹${this.getSubtotal().toFixed(2)}`;
    }

    /**
     * Serializes cart item for storage or receipt generation
     */
    toJSON() {
        return {
            foodItem: this.foodItem.toJSON(),
            quantity: this.quantity,
            subtotal: this.getSubtotal()
        };
    }
}

/**
 * Class: Cart
 * Manages the current customer's active food basket.
 */
class Cart {
    // --- OOP CONCEPT: ENCAPSULATION ---
    // #items is private so external scripts cannot corrupt the array structure
    #items = [];

    constructor() {
        this.#items = [];
    }

    /**
     * Adds an item to the cart or increments existing quantity
     * @param {FoodItem} foodItem - The FoodItem instance to add
     * @param {number} quantity - Quantity to add
     * @returns {CartItem}
     */
    addItem(foodItem, quantity = 1) {
        if (!foodItem) return null;

        const existingItem = this.findItem(foodItem.id);
        if (existingItem) {
            existingItem.quantity += quantity;
            return existingItem;
        }

        const newItem = new CartItem(foodItem, quantity);
        this.#items.push(newItem);
        return newItem;
    }

    /**
     * Removes an item completely from the cart by its FoodItem ID
     * @param {string} id - Food item ID
     * @returns {boolean} True if removed, false if not found
     */
    removeItem(id) {
        const initialLength = this.#items.length;
        this.#items = this.#items.filter(item => item.foodItem.id !== id);
        return this.#items.length < initialLength;
    }

    /**
     * Increments the quantity of a specific item
     * @param {string} id - Food item ID
     */
    increaseQuantity(id) {
        const item = this.findItem(id);
        if (item) {
            item.increase();
            return item.quantity;
        }
        return null;
    }

    /**
     * Decrements the quantity of a specific item.
     * If quantity reaches zero, optionally removes item or keeps at 1.
     * @param {string} id - Food item ID
     * @param {boolean} autoRemoveIfZero - If true, removes item when quantity < 1
     */
    decreaseQuantity(id, autoRemoveIfZero = true) {
        const item = this.findItem(id);
        if (!item) return null;

        if (item.quantity > 1) {
            item.decrease();
            return item.quantity;
        } else if (autoRemoveIfZero) {
            this.removeItem(id);
            return 0; // Indicating removal
        }
        return 1;
    }

    /**
     * Finds a CartItem in the cart by FoodItem ID
     * @param {string} id 
     * @returns {CartItem|undefined}
     */
    findItem(id) {
        return this.#items.find(item => item.foodItem.id === id);
    }

    /**
     * Calculates the sum of all item subtotals in the cart
     * Demonstrates aggregation across child objects
     * @returns {number}
     */
    calculateSubtotal() {
        const total = this.#items.reduce((sum, item) => sum + item.getSubtotal(), 0);
        return Math.round(total * 100) / 100;
    }

    /**
     * Returns total number of distinct food items
     * @returns {number}
     */
    getItemCount() {
        return this.#items.length;
    }

    /**
     * Returns sum of quantities of all items (e.g. 2 burgers + 3 cokes = 5)
     * @returns {number}
     */
    getTotalQuantity() {
        return this.#items.reduce((sum, item) => sum + item.quantity, 0);
    }

    /**
     * Provides a safe read-only snapshot of the cart items
     * (Defensive copy prevents external tampering with private array)
     * @returns {CartItem[]}
     */
    getItems() {
        return [...this.#items];
    }

    /**
     * Clears all items from the cart
     */
    clearCart() {
        this.#items = [];
    }

    /**
     * Checks if the cart has no items
     * @returns {boolean}
     */
    isEmpty() {
        return this.#items.length === 0;
    }

    /**
     * Serializes cart data
     */
    toJSON() {
        return this.#items.map(item => item.toJSON());
    }
}

// Attach to window
if (typeof window !== 'undefined') {
    window.CartItem = CartItem;
    window.Cart = Cart;
}
