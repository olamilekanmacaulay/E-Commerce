const Order = require("../Models/order.model");
const Cart = require("../Models/cart.model");
const { reduceStock } = require("./stock.controller"); // Import reduceStock function

// create a new order from the user's cart.

exports.createOrder = async (req,res) => {
    try {
        // Fetch the user's cart items and populate product details
        const cartItems = await Cart.find({ user: req.user.id }).populate("product");
        
        // Check if the cart is empty
        if (cartItems.length === 0) {
            return res.json({ message: "Cart is empty, Order something" });
        }

        // Calculate the total order amount
        const totalAmount = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
        
        // Reduce stock for each product in the cart
        for (const item of cartItems) {
            await reduceStock(item.product._id, item.quantity);
        }

        // Create the order
        const order = await Order.create({
            user: req.user.id,
            items: cartItems.map(({ product, quantity }) => ({
                product: product._id,
                quantity,
                price: product.price,
            })),
            totalAmount
        });

        // Clear cart
        await Cart.deleteMany({ user: req.user.id });

        res.json({ message: 'Order created successfully', order });
    } catch (err) {
        res.status(400).json({ message: 'Error creating order' });
    }
};

// Get all orders(Admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "username email") // Include user details
            .populate("items.product", "name price"); // Include product details
        res.json(orders);
    } catch {
        res.status(500).json({ message: "Error Fetching orders"});
    }
};

// Update order status (Admin only)
exports.updateOrderStatus = async ( req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        //Update the order status
        order.status = status;
        await order.save();

        res.json({ message: "Order status updated successfully", order });
    } catch {
        res.status(400).json({ message: "Error updating order status" });
    }
};
