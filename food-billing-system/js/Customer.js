/**
 * ============================================================================
 * FoodEase - Food Billing System
 * Module: Customer.js
 * 
 * Demonstrates Core OOP Concepts:
 * 1. ENCAPSULATION: Customer details (#name, #phone, #email, #tableNumber, #address)
 *    are held in private fields with robust accessor methods and validation logic.
 * 2. ABSTRACTION: Validates complex business constraints (regex phone, email patterns,
 *    order-type conditional constraints) behind a clean `validate(orderType)` API.
 * 3. SEPARATION OF CONCERNS: Customer manages patron state and verification;
 *    CustomerManager manages the persistence and aggregation of customer directories.
 * ============================================================================
 */

class Customer {
    // --- OOP CONCEPT: ENCAPSULATION (Private Fields) ---
    #name;
    #phone;
    #email;
    #tableNumber;
    #address;

    /**
     * @param {string} name - Customer full name
     * @param {string} phone - 10-digit mobile number
     * @param {string} email - Valid email address
     * @param {string|number} tableNumber - Table number for Dine In orders
     * @param {string} address - Delivery address for Delivery orders
     */
    constructor(name = '', phone = '', email = '', tableNumber = '', address = '') {
        this.#name = name.trim();
        this.#phone = phone.trim();
        this.#email = email.trim();
        this.#tableNumber = String(tableNumber || '').trim();
        this.#address = address.trim();
    }

    // --- Getters & Setters ---
    get name() {
        return this.#name;
    }
    set name(value) {
        this.#name = (value || '').trim();
    }

    get phone() {
        return this.#phone;
    }
    set phone(value) {
        this.#phone = (value || '').trim();
    }

    get email() {
        return this.#email;
    }
    set email(value) {
        this.#email = (value || '').trim();
    }

    get tableNumber() {
        return this.#tableNumber;
    }
    set tableNumber(value) {
        this.#tableNumber = String(value || '').trim();
    }

    get address() {
        return this.#address;
    }
    set address(value) {
        this.#address = (value || '').trim();
    }

    // --- Validation Rules (Encapsulated business logic) ---

    /**
     * Validates customer name (non-empty, at least 2 characters)
     * @returns {{isValid: boolean, message: string}}
     */
    validateName() {
        if (!this.#name) {
            return { isValid: false, message: "Customer name is required." };
        }
        if (this.#name.length < 2) {
            return { isValid: false, message: "Customer name must be at least 2 characters." };
        }
        return { isValid: true, message: "" };
    }

    /**
     * Validates phone number (standard 10-digit Indian mobile format)
     * @returns {{isValid: boolean, message: string}}
     */
    validatePhone() {
        if (!this.#phone) {
            return { isValid: false, message: "Phone number is required." };
        }
        // Accepts 10 digits, optionally prefixed with +91 or 0
        const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
        const cleanPhone = this.#phone.replace(/[\s\-]/g, '');
        if (!phoneRegex.test(cleanPhone) && !/^\d{10}$/.test(cleanPhone)) {
            return { isValid: false, message: "Please enter a valid 10-digit mobile number." };
        }
        return { isValid: true, message: "" };
    }

    /**
     * Validates email address format
     * @returns {{isValid: boolean, message: string}}
     */
    validateEmail() {
        if (!this.#email) {
            // Email is optional in many quick-serve restaurants, but if provided, must be valid
            return { isValid: true, message: "" };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.#email)) {
            return { isValid: false, message: "Please enter a valid email address (e.g., name@example.com)." };
        }
        return { isValid: true, message: "" };
    }

    /**
     * Validates customer information dynamically based on order type
     * @param {string} orderType - 'dine-in' | 'takeaway' | 'delivery'
     * @returns {{isValid: boolean, errors: Object<string, string>}}
     */
    validate(orderType = 'dine-in') {
        const errors = {};

        const nameCheck = this.validateName();
        if (!nameCheck.isValid) errors.name = nameCheck.message;

        const phoneCheck = this.validatePhone();
        if (!phoneCheck.isValid) errors.phone = phoneCheck.message;

        const emailCheck = this.validateEmail();
        if (!emailCheck.isValid) errors.email = emailCheck.message;

        if (orderType === 'dine-in') {
            if (!this.#tableNumber) {
                errors.tableNumber = "Table number is required for Dine-In orders.";
            }
        } else if (orderType === 'delivery') {
            if (!this.#address || this.#address.length < 5) {
                errors.address = "Please provide a complete delivery address (min 5 chars).";
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    /**
     * Returns a quick summary of the customer
     * @returns {string}
     */
    getInfoSummary() {
        return `${this.#name} (${this.#phone})${this.#tableNumber ? ' | Table: ' + this.#tableNumber : ''}`;
    }

    /**
     * Serializes Customer object to plain JavaScript object
     */
    toJSON() {
        return {
            name: this.#name,
            phone: this.#phone,
            email: this.#email,
            tableNumber: this.#tableNumber,
            address: this.#address
        };
    }

    /**
     * Static Factory Method to reconstruct a Customer instance from stored JSON
     * @param {Object} json 
     * @returns {Customer}
     */
    static fromJSON(json) {
        if (!json) return new Customer();
        return new Customer(
            json.name || '',
            json.phone || '',
            json.email || '',
            json.tableNumber || '',
            json.address || ''
        );
    }
}

// Attach to window
if (typeof window !== 'undefined') {
    window.Customer = Customer;
}
