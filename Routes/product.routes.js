const express = require("express");
const { 
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getCategories, 
    addProduct, 
    getProductsByCategory 
} = require("../Controllers/product.controller");
const {authorization, adminOnly } = require("../Middlewares/Authentication")
const router = express.Router();


// Get all products
router.get("/products", getAllProducts);



// Get Categories
router.get("/categories", getCategories);

// Add product (Admin Only)
router.post("/products/addproduct", authorization, adminOnly, addProduct);

//Get Products by Category
router.get("/categories/:category", getProductsByCategory);

// Get a single product by ID
router.get("/products/:id", getProductById);

// Update a product (Admin only)
router.put("/products/:id", authorization, adminOnly, updateProduct);

// Delete a product (Admin only)
router.delete("/products/:id", authorization, adminOnly, deleteProduct);

module.exports = router;