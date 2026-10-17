/**
 * ============================================================================
 * FoodEase - Food Billing System
 * Module: Billing.js
 * 
 * Demonstrates Core OOP Concepts:
 * 1. ENCAPSULATION:
 *    - Uses private fields (#gstRate, #discountRate) to restrict arbitrary
 *      modifications to legal taxation and discount parameters.
 *    - Exposes strict getters and validated setters.
 * 2. ABSTRACTION:
 *    - Encapsulates complex financial calculations (Taxable Base, CGST, SGST,
 *      Net Discounts, Grand Totals) behind an intuitive public method:
 *      calculateBreakdown().
 *    - Callers do not need to perform manual arithmetic or currency rounding.
 * ============================================================================
 */

class Billing {
    // --- OOP CONCEPT: ENCAPSULATION (Private Fields) ---
    // #gstRate and #discountRate cannot be accessed or altered directly from outside the class.
    #gstRate;
    #discountRate;

    /**
     * @param {number} gstRate - Default GST percentage (e.g., 5 for 5% restaurant GST)
     * @param {number} discountRate - Default discount percentage (e.g., 0 or 10)
     */
    constructor(gstRate = 5, discountRate = 0) {
        this.#gstRate = this.#sanitizeRate(gstRate, 5);
        this.#discountRate = this.#sanitizeRate(discountRate, 0);
    }

    /**
     * Private helper to validate tax / discount percentage bounds (0% to 100%)
     */
    #sanitizeRate(rate, defaultVal = 0) {
        const num = parseFloat(rate);
        if (isNaN(num) || num < 0 || num > 100) {
            return defaultVal;
        }
        return num;
    }

    // --- ENCAPSULATION: Getters & Setters ---

    /**
     * Returns the current GST percentage rate
     * @returns {number}
     */
    getGSTRate() {
        return this.#gstRate;
    }

    /**
     * Sets a new GST rate with boundary validation
     * @param {number} newRate
     */
    setGSTRate(newRate) {
        const validated = this.#sanitizeRate(newRate, -1);
        if (validated === -1) {
            throw new Error("[Billing Encapsulation] GST rate must be a valid percentage between 0 and 100.");
        }
        this.#gstRate = validated;
    }

    /**
     * Returns the default discount rate
     * @returns {number}
     */
    getDiscountRate() {
        return this.#discountRate;
    }

    /**
     * Sets a new discount rate with boundary validation
     * @param {number} newRate
     */
    setDiscountRate(newRate) {
        const validated = this.#sanitizeRate(newRate, -1);
        if (validated === -1) {
            throw new Error("[Billing Encapsulation] Discount rate must be a valid percentage between 0 and 100.");
        }
        this.#discountRate = validated;
    }

    /**
     * Calculates discount amount based on subtotal and given rate
     * @param {number} amount - Subtotal
     * @param {number} [customRate] - Optional custom discount percentage
     * @returns {number}
     */
    calculateDiscount(amount, customRate = null) {
        const rate = customRate !== null ? this.#sanitizeRate(customRate, 0) : this.#discountRate;
        const discount = (amount * rate) / 100;
        return Math.round(discount * 100) / 100;
    }

    /**
     * Calculates total GST amount on the taxable amount
     * @param {number} taxableAmount - Subtotal minus discounts
     * @returns {number}
     */
    calculateGST(taxableAmount) {
        if (taxableAmount <= 0) return 0;
        const gst = (taxableAmount * this.#gstRate) / 100;
        return Math.round(gst * 100) / 100;
    }

    /**
     * Comprehensive Financial Breakdown Method
     * Performs end-to-end bill arithmetic and splits GST into CGST & SGST
     * for authentic restaurant compliance.
     * 
     * Formula:
     * 1. Subtotal = Sum of Item Subtotals
     * 2. Discount Amount = Subtotal * (Discount Rate / 100)
     * 3. Taxable Amount = Subtotal - Discount Amount
     * 4. GST Amount = Taxable Amount * (GST Rate / 100)
     *    -> CGST = GST Amount / 2
     *    -> SGST = GST Amount / 2
     * 5. Grand Total = Taxable Amount + GST Amount + Delivery Fee
     * 
     * @param {number} subtotal 
     * @param {number} [customDiscountPercent] 
     * @param {number} [deliveryFee=0]
     * @returns {Object} Complete financial breakdown
     */
    calculateBreakdown(subtotal, customDiscountPercent = null, deliveryFee = 0) {
        const safeSubtotal = Math.max(0, parseFloat(subtotal) || 0);
        const discountPercent = customDiscountPercent !== null 
            ? this.#sanitizeRate(customDiscountPercent, this.#discountRate) 
            : this.#discountRate;

        const discountAmount = this.calculateDiscount(safeSubtotal, discountPercent);
        const taxableAmount = Math.max(0, safeSubtotal - discountAmount);
        const totalGst = this.calculateGST(taxableAmount);

        // Indian Restaurant GST standard: 5% split into 2.5% CGST + 2.5% SGST
        const halfGstRate = this.#gstRate / 2;
        const cgstAmount = Math.round((totalGst / 2) * 100) / 100;
        const sgstAmount = Math.round((totalGst - cgstAmount) * 100) / 100;

        const safeDeliveryFee = Math.max(0, parseFloat(deliveryFee) || 0);
        const grandTotal = Math.round((taxableAmount + totalGst + safeDeliveryFee) * 100) / 100;

        return {
            subtotal: safeSubtotal,
            discountPercent: discountPercent,
            discountAmount: discountAmount,
            taxableAmount: taxableAmount,
            gstPercent: this.#gstRate,
            cgstPercent: halfGstRate,
            cgstAmount: cgstAmount,
            sgstPercent: halfGstRate,
            sgstAmount: sgstAmount,
            totalGst: totalGst,
            deliveryFee: safeDeliveryFee,
            grandTotal: grandTotal,
            // Formatted string representations
            formatted: {
                subtotal: this.formatCurrency(safeSubtotal),
                discountAmount: `-${this.formatCurrency(discountAmount)}`,
                taxableAmount: this.formatCurrency(taxableAmount),
                cgstAmount: this.formatCurrency(cgstAmount),
                sgstAmount: this.formatCurrency(sgstAmount),
                totalGst: this.formatCurrency(totalGst),
                deliveryFee: this.formatCurrency(safeDeliveryFee),
                grandTotal: this.formatCurrency(grandTotal)
            }
        };
    }

    /**
     * Utility method to format any number as Indian Rupee
     * @param {number} amount 
     * @returns {string} e.g. "₹746.55"
     */
    formatCurrency(amount) {
        const num = parseFloat(amount) || 0;
        return `₹${num.toFixed(2)}`;
    }
}

// Attach to window
if (typeof window !== 'undefined') {
    window.Billing = Billing;
}
