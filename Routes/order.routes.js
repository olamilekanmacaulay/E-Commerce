const express = require("express");
const { 
    createOrder, 
    updateOrderStatus, 
    getAllOrders,
    getMyOrders,
    getOrder
} = require("../Controllers/order.controller");

const { authorization, adminOnly } = require("../Middlewares/Authentication");
const router = express.Router();

// Get all orders (Admin only)
router.get("/", authorization, adminOnly, getAllOrders);

// Create an order
router.post("/order", authorization, createOrder);

// Update order status (Admin only)
router.put("/:id", authorization, adminOnly, updateOrderStatus);

// Get the user's orders
router.get("/my-orders", authorization, getMyOrders);

// Get a single order by ID
router.get("/:id", authorization, getOrder);


module.exports = router;