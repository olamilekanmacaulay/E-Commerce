const express = require("express");
const { createOrder, updateOrderStatus, getAllOrders } = require("../Controllers/order.controller");
const { authorization, adminOnly } = require("../Middlewares/Authentication");
const router = express.Router();

// Get all orders (Admin only)
router.get("/", authorization, adminOnly, getAllOrders);

// Create an order
router.post("/order", authorization, createOrder);

// Update order status (Admin only)
router.put("/:orderId/status", authorization, adminOnly, updateOrderStatus);

module.exports = router;