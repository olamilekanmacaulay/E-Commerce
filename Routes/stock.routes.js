const express = require('express');
const { addStock } = require("../Controllers/stock.controller");
const { authorization, adminOnly } = require("../Middlewares/Authentication");
const router = express.Router();

// Add stock to a product (Admin only)
router.post('/admin/add', authorization , adminOnly, addStock);

module.exports = router;