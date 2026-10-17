/**
 * ============================================================================
 * FoodEase - Food Billing System
 * Module: FoodItem.js
 * 
 * Demonstrates Core OOP Concepts:
 * 1. CLASS & OBJECT: Blueprint for food items and instances created from it.
 * 2. CONSTRUCTOR: Initializes item properties (id, name, price, etc.).
 * 3. ENCAPSULATION: Uses private fields (#price, #id) with getters and setters
 *    to protect internal state and validate price modifications.
 * 4. INHERITANCE: VegItem and NonVegItem extend base FoodItem using 'extends' and 'super'.
 * 5. POLYMORPHISM: Derived classes override getBadgeHTML() and getTypeDetails()
 *    to produce distinct outputs specific to their food classification.
 * 6. ABSTRACTION: Exposes clean public methods for UI formatting while hiding details.
 * ============================================================================
 */

/**
 * Base Class: FoodItem
 * Serves as the parent class for all food and beverage products in the menu.
 */
class FoodItem {
    // --- OOP CONCEPT: ENCAPSULATION (Private Fields) ---
    // #id and #price are private to prevent unauthorized direct modification from outside
    #id;
    #price;

    /**
     * Constructor to initialize common food item attributes
     * @param {string} id - Unique identifier (e.g., 'V01', 'N02')
     * @param {string} name - Display name of the food item
     * @param {string} category - Category (Burgers, Pizza, Indian, Chinese, Beverages, Desserts)
     * @param {number} price - Unit price in INR (must be positive)
     * @param {string} description - Short description of ingredients or taste
     * @param {string} type - 'veg' | 'non-veg' | 'beverage'
     * @param {string} image - Image URL or local image path
     */
    constructor(id, name, category, price, description, type = 'veg', image = '') {
        // Enforce abstract-like behavior: Base FoodItem shouldn't be directly instantiated if strictly typed
        if (new.target === FoodItem) {
            // Permitted for generic/beverage items, but subclasses are preferred for Veg/Non-Veg
        }

        this.#id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.type = type;
        this.image = image || 'images/burger.svg';
        
        // Encapsulated price validation
        this.price = price;
    }

    // --- ENCAPSULATION: Getters & Setters ---
    get id() {
        return this.#id;
    }

    get price() {
        return this.#price;
    }

    set price(newPrice) {
        if (typeof newPrice !== 'number' || newPrice < 0) {
            throw new Error(`[Encapsulation Violation] Price for "${this.name}" must be a non-negative number.`);
        }
        this.#price = Math.round(newPrice * 100) / 100;
    }

    /**
     * Formats price with Indian Rupee symbol
     * @returns {string} Formatted price string (e.g., "₹150.00")
     */
    getFormattedPrice() {
        return `₹${this.#price.toFixed(2)}`;
    }

    /**
     * Basic item details string
     * @returns {string}
     */
    getDetails() {
        return `${this.name} (${this.category}) - ${this.getFormattedPrice()}`;
    }

    // --- OOP CONCEPT: POLYMORPHISM (Base Implementation to be overridden) ---
    /**
     * Returns visual indicator badge HTML for the UI
     * Base returns generic badge; Subclasses override with Veg/Non-Veg icons
     */
    getBadgeHTML() {
        return `<span class="food-badge generic-badge"><i class="fa-solid fa-utensils"></i> Standard</span>`;
    }

    /**
     * Returns classification detail text for tooltips / viva demo
     */
    getTypeDetails() {
        return "General Menu Item";
    }

    /**
     * Checks if item is vegetarian
     * @returns {boolean}
     */
    isVegetarian() {
        return this.type === 'veg';
    }

    /**
     * Converts food item object to plain JSON representation for serialization
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            category: this.category,
            price: this.price,
            description: this.description,
            type: this.type,
            image: this.image
        };
    }
}

/**
 * ============================================================================
 * OOP CONCEPT: INHERITANCE
 * Derived Class: VegItem extends FoodItem
 * Represents 100% Vegetarian menu items
 * ============================================================================
 */
class VegItem extends FoodItem {
    /**
     * Calls parent constructor with type set to 'veg'
     */
    constructor(id, name, category, price, description, image = '') {
        // 'super' passes common parameters to parent FoodItem constructor
        super(id, name, category, price, description, 'veg', image);
        this.dietaryTag = "100% Veg";
    }

    // --- OOP CONCEPT: POLYMORPHISM (Method Overriding) ---
    /**
     * Polymorphic implementation of badge for green Veg symbol
     */
    getBadgeHTML() {
        return `
            <span class="food-badge veg-badge" title="Vegetarian Food">
                <span class="diet-icon veg-icon"><span class="diet-dot"></span></span>
                <span>Pure Veg</span>
            </span>
        `;
    }

    /**
     * Polymorphic override of category info
     */
    getTypeDetails() {
        return "100% Vegetarian (Pure Plant / Dairy Ingredients)";
    }

    /**
     * Checks if item is vegetarian
     */
    isVegetarian() {
        return true;
    }
}

/**
 * ============================================================================
 * OOP CONCEPT: INHERITANCE
 * Derived Class: NonVegItem extends FoodItem
 * Represents Non-Vegetarian menu items
 * ============================================================================
 */
class NonVegItem extends FoodItem {
    /**
     * Calls parent constructor with type set to 'non-veg'
     */
    constructor(id, name, category, price, description, image = '') {
        // 'super' passes common parameters to parent FoodItem constructor
        super(id, name, category, price, description, 'non-veg', image);
        this.dietaryTag = "Non-Veg";
    }

    // --- OOP CONCEPT: POLYMORPHISM (Method Overriding) ---
    /**
     * Polymorphic implementation of badge for red Non-Veg symbol
     */
    getBadgeHTML() {
        return `
            <span class="food-badge nonveg-badge" title="Non-Vegetarian Food">
                <span class="diet-icon nonveg-icon"><span class="diet-triangle"></span></span>
                <span>Non-Veg</span>
            </span>
        `;
    }

    /**
     * Polymorphic override of category info
     */
    getTypeDetails() {
        return "Non-Vegetarian (Contains Fresh Poultry, Meat or Seafood)";
    }

    /**
     * Checks if item is vegetarian
     */
    isVegetarian() {
        return false;
    }
}

// Export for ES modules and attach to window for straightforward browser script inclusion
if (typeof window !== 'undefined') {
    window.FoodItem = FoodItem;
    window.VegItem = VegItem;
    window.NonVegItem = NonVegItem;
}
