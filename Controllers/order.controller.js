const Order = require("../Models/order.model");
const Cart = require("../Models/cart.model");
const { reduceStock } = require("./stock.controller"); // Import reduceStock function

//create an order
exports.createOrder = async (req,res) => {
    try {
        // Fetch the user's cart items and populate product details
        const cartItems = await Cart.find({ user: req.user.id }).populate("product");
        
        // Check if the cart is empty
        if (cartItems.length === 0) {
            return res.send("Cart is empty, Order something");
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
            items: cartItems.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price,
            })),
            totalAmount,
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
        const orders = await Order.find().populate("user", "username email").populate("items.product", "name price");
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
