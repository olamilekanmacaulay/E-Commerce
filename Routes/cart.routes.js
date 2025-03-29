const express = require("express");
const { 
    addToCart, 
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require("../Controllers/cart.controller");

const validateQuantity = require("../Middlewares/validateQuantity");
const { authorization } = require("../Middlewares/Authentication");

const router = express.Router();

// Add product to Cart
router.post("/cart/add", authorization, validateQuantity, addToCart);

// Get User's cart
router.get("/cart", authorization, getCart);

// Update a cart item
router.put("/cart/:productId", authorization, validateQuantity, updateCartItem);

// Remove a product from the cart
router.delete("/cart/:productId", authorization, removeFromCart);

// Clear the cart
router.delete("/cart/clear", authorization, clearCart);

module.exports = router;