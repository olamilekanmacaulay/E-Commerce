const express = require("express");
const { getCategories, addProduct, getProductsByCategory } = require("../Controllers/product.controller");
const {authorization, adminOnly } = require("../Middlewares/Authentication")
const router = express.Router();

router.get("/categories", getCategories);

router.post("/product/addproduct", authorization, adminOnly, addProduct);
router.get('/category/:category', getProductsByCategory);

module.exports = router;