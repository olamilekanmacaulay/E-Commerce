const express = require("express");
const { addToCart, getCart } = require("../Controllers/cart.controller");
const { authorization } = require("../Middlewares/Authentication");

const router = express.Router();

// Add product to Cart
router.post("/cart", authorization, addToCart);

// Get User's cart
router.get("/cart", authorization, getCart);

module.exports = router;