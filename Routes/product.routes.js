const express = require("express");
const { getCategories, addProduct, getProductsByCategory } = require("../Controllers/product.controller");
const {authorization, adminOnly } = require("../Middlewares/Authentication")
const router = express.Router();

// Get Categories
router.get("/categories", getCategories);

// Add product (Admin Only)
router.post("/product/addproduct", authorization, adminOnly, addProduct);

//Get Products by Category
router.get('/category/:category', getProductsByCategory);

module.exports = router;