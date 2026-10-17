/**
 * ============================================================================
 * FoodEase - Food Billing System
 * Module: data.js
 * 
 * Contains initial food catalogue instantiated using OOP classes (VegItem, NonVegItem)
 * and seed orders to populate the Dashboard, Charts, and Order History.
 * ============================================================================
 */

// --- Initial Food Menu Items (Instantiated using OOP Classes) ---
const INITIAL_FOOD_ITEMS = [
    // --- Burgers ---
    new VegItem(
        "B01",
        "Classic Veg Burger",
        "Burgers",
        120,
        "Crispy potato patty topped with lettuce, sliced tomatoes, and creamy mayo in a sesame bun.",
        "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60"
    ),
    new VegItem(
        "B02",
        "Cheese Burger",
        "Burgers",
        150,
        "Grilled veggie patty with melted cheddar cheese slice, caramelized onions, and house sauce.",
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60"
    ),
    new NonVegItem(
        "B03",
        "Crispy Chicken Burger",
        "Burgers",
        180,
        "Deep-fried spiced crispy chicken breast fillet with zesty coleslaw and spicy chipotle mayo.",
        "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&auto=format&fit=crop&q=60"
    ),
    new VegItem(
        "B04",
        "Spicy Paneer Burger",
        "Burgers",
        160,
        "Crispy fried cottage cheese patty loaded with peri-peri seasonings and mint mayo.",
        "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60"
    ),

    // --- Pizza ---
    new VegItem(
        "P01",
        "Margherita Pizza",
        "Pizza",
        200,
        "Classic Italian crust topped with rich tomato passata, fresh mozzarella cheese, and basil leaves.",
        "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=60"
    ),
    new VegItem(
        "P02",
        "Farmhouse Veg Pizza",
        "Pizza",
        250,
        "Loaded with bell peppers, sweet corn, mushrooms, black olives, and mozzarella on a golden crust.",
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60"
    ),
    new NonVegItem(
        "P03",
        "Chicken BBQ Pizza",
        "Pizza",
        280,
        "Smoky BBQ chicken chunks, red onion slices, jalapeños, and melted smoked gouda cheese.",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60"
    ),
    new VegItem(
        "P04",
        "Paneer Tikka Pizza",
        "Pizza",
        260,
        "Tandoori roasted paneer cubes with capsicum, red paprika, and aromatic Indian spices.",
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60"
    ),

    // --- Indian ---
    new VegItem(
        "I01",
        "Paneer Tikka",
        "Indian",
        180,
        "Chargrilled cottage cheese cubes marinated in spiced yogurt with roasted peppers and onions.",
        "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60"
    ),
    new NonVegItem(
        "I02",
        "Butter Chicken",
        "Indian",
        280,
        "Tender tandoori chicken cooked in a rich, buttery, velvety tomato and cashew nut gravy.",
        "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60"
    ),
    new NonVegItem(
        "I03",
        "Hyderabadi Chicken Biryani",
        "Indian",
        240,
        "Dum cooked fragrant long-grain basmati rice layered with succulent marinated chicken and saffron.",
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60"
    ),
    new VegItem(
        "I04",
        "Dal Makhani",
        "Indian",
        170,
        "Slow-cooked black lentils and kidney beans simmered overnight with butter and fresh dairy cream.",
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60"
    ),

    // --- Chinese ---
    new VegItem(
        "C01",
        "Veg Hakka Noodles",
        "Chinese",
        150,
        "Wok-tossed noodles with crunchy julienned vegetables, soy sauce, and mild white pepper.",
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60"
    ),
    new NonVegItem(
        "C02",
        "Chicken Fried Rice",
        "Chinese",
        180,
        "Stir-fried jasmine rice with scrambled egg, shredded chicken, scallions, and light soy sauce.",
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60"
    ),
    new VegItem(
        "C03",
        "Chilli Paneer Dry",
        "Chinese",
        170,
        "Batter-fried paneer cubes tossed with green chilies, capsicum, and spicy Sichuan sauce.",
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60"
    ),
    new NonVegItem(
        "C04",
        "Chicken Manchurian",
        "Chinese",
        190,
        "Crispy fried chicken balls coated in a spicy, tangy Indo-Chinese dark gravy.",
        "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60"
    ),

    // --- Beverages ---
    new VegItem(
        "D01",
        "Coca Cola (500ml)",
        "Beverages",
        60,
        "Chilled refreshing sparkling soda beverage served with ice cubes and lemon wedge.",
        "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60"
    ),
    new VegItem(
        "D02",
        "Fresh Lime Soda",
        "Beverages",
        80,
        "Freshly squeezed lime juice with club soda, rock salt, and sweet sugar syrup.",
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60"
    ),
    new VegItem(
        "D03",
        "Cold Coffee with Ice Cream",
        "Beverages",
        120,
        "Rich blended espresso with chilled milk, chocolate syrup, and a scoop of vanilla ice cream.",
        "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60"
    ),
    new VegItem(
        "D04",
        "Mango Smoothie",
        "Beverages",
        110,
        "Thick blended Alphonso mango pulp with Greek yogurt, honey, and chia seeds.",
        "https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=60"
    ),

    // --- Desserts ---
    new VegItem(
        "S01",
        "Belgian Chocolate Brownie",
        "Desserts",
        120,
        "Warm fudgy dark chocolate brownie drizzled with hot melted chocolate ganache.",
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60"
    ),
    new VegItem(
        "S02",
        "Gulab Jamun (2 Pcs)",
        "Desserts",
        90,
        "Traditional milk-solid dumplings fried golden and soaked in warm cardamom-infused rose sugar syrup.",
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60"
    ),
    new VegItem(
        "S03",
        "Vanilla Ice Cream Sundae",
        "Desserts",
        80,
        "Two scoops of rich Madagascar vanilla bean ice cream with chocolate fudge and roasted nuts.",
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=60"
    ),
    new VegItem(
        "S04",
        "Royal Falooda",
        "Desserts",
        140,
        "Rose flavored milk drink layered with vermicelli, basil seeds, rabri, and kulfi scoop.",
        "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500&auto=format&fit=crop&q=60"
    )
];

// --- Default Restaurant System Settings ---
const DEFAULT_SETTINGS = {
    restaurantName: "FoodEase",
    subtitle: "Smart Restaurant Billing & Order Management",
    address: "Shop 12-14, Food Court Avenue, Cyber City, Mumbai - 400051",
    phone: "+91 98765 43210",
    email: "billing@foodease.com",
    gstin: "27AABCU9603R1ZM",
    currency: "₹",
    gstRate: 5, // 5% Standard Indian Restaurant GST
    defaultDiscount: 0,
    theme: "light"
};

// --- Seed Orders for initial Dashboard & Reports display ---
function getInitialSampleOrders() {
    const billing = new Billing(5, 0);

    // Order 1: Dine In
    const o1Customer = new Customer("Rahul Sharma", "9876543210", "rahul.s@example.com", "12");
    const o1Items = [
        { foodItem: INITIAL_FOOD_ITEMS.find(f => f.id === "B02").toJSON(), quantity: 2, subtotal: 300 },
        { foodItem: INITIAL_FOOD_ITEMS.find(f => f.id === "P01").toJSON(), quantity: 1, subtotal: 200 },
        { foodItem: INITIAL_FOOD_ITEMS.find(f => f.id === "D03").toJSON(), quantity: 2, subtotal: 240 }
    ];
    const o1Subtotal = 300 + 200 + 240; // 740
    const o1Breakdown = billing.calculateBreakdown(o1Subtotal, 10); // 10% discount
    const order1 = Order.createOrder({
        orderId: "ORD-20261017-001",
        customer: o1Customer,
        items: o1Items,
        orderType: "dine-in",
        tableNumber: "12",
        paymentMethod: "UPI",
        breakdown: o1Breakdown,
        date: new Date(Date.now() - 3600000 * 3), // 3 hours ago
        status: "Completed"
    });

    // Order 2: Takeaway
    const o2Customer = new Customer("Aman Verma", "9823456789", "aman.v@example.com", "");
    const o2Items = [
        { foodItem: INITIAL_FOOD_ITEMS.find(f => f.id === "I03").toJSON(), quantity: 2, subtotal: 480 },
        { foodItem: INITIAL_FOOD_ITEMS.find(f => f.id === "D01").toJSON(), quantity: 2, subtotal: 120 }
    ];
    const o2Subtotal = 480 + 120; // 600
    const o2Breakdown = billing.calculateBreakdown(o2Subtotal, 5); // 5% discount
    const order2 = Order.createOrder({
        orderId: "ORD-20261017-002",
        customer: o2Customer,
        items: o2Items,
        orderType: "takeaway",
        paymentMethod: "Cash",
        breakdown: o2Breakdown,
        date: new Date(Date.now() - 3600000 * 2), // 2 hours ago
        status: "Completed"
    });

    // Order 3: Delivery
    const o3Customer = new Customer("Pooja Patel", "9765432109", "pooja.p@example.com", "", "Flat 402, Green Valley Apartments, Mumbai");
    const o3Items = [
        { foodItem: INITIAL_FOOD_ITEMS.find(f => f.id === "P02").toJSON(), quantity: 1, subtotal: 250 },
        { foodItem: INITIAL_FOOD_ITEMS.find(f => f.id === "C01").toJSON(), quantity: 1, subtotal: 150 },
        { foodItem: INITIAL_FOOD_ITEMS.find(f => f.id === "S01").toJSON(), quantity: 2, subtotal: 240 }
    ];
    const o3Subtotal = 250 + 150 + 240; // 640
    const o3Breakdown = billing.calculateBreakdown(o3Subtotal, 0, 40); // 40 delivery fee
    const order3 = Order.createOrder({
        orderId: "ORD-20261017-003",
        customer: o3Customer,
        items: o3Items,
        orderType: "delivery",
        deliveryAddress: "Flat 402, Green Valley Apartments, Mumbai",
        paymentMethod: "Credit Card",
        breakdown: o3Breakdown,
        date: new Date(Date.now() - 3600000 * 1), // 1 hour ago
        status: "Completed"
    });

    // Order 4: Dine In (Earlier today)
    const o4Customer = new Customer("Vikram Singh", "9912345678", "vikram@example.com", "05");
    const o4Items = [
        { foodItem: INITIAL_FOOD_ITEMS.find(f => f.id === "I02").toJSON(), quantity: 1, subtotal: 280 },
        { foodItem: INITIAL_FOOD_ITEMS.find(f => f.id === "I01").toJSON(), quantity: 1, subtotal: 180 },
        { foodItem: INITIAL_FOOD_ITEMS.find(f => f.id === "D02").toJSON(), quantity: 2, subtotal: 160 }
    ];
    const o4Subtotal = 280 + 180 + 160; // 620
    const o4Breakdown = billing.calculateBreakdown(o4Subtotal, 0);
    const order4 = Order.createOrder({
        orderId: "ORD-20261017-004",
        customer: o4Customer,
        items: o4Items,
        orderType: "dine-in",
        tableNumber: "05",
        paymentMethod: "Debit Card",
        breakdown: o4Breakdown,
        date: new Date(Date.now() - 1800000), // 30 mins ago
        status: "Completed"
    });

    return [order1, order2, order3, order4];
}

// Attach to window
if (typeof window !== 'undefined') {
    window.INITIAL_FOOD_ITEMS = INITIAL_FOOD_ITEMS;
    window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
    window.getInitialSampleOrders = getInitialSampleOrders;
}
