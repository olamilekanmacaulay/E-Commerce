const Order = require("../Models/order.model");
const Cart = require("../Models/cart.model");

// create a new order from the user's cart.

exports.createOrder = async (req,res) => {
    const { shippingAddress, paymentMethod } = req.body;
    try {
        // Fetch the user's cart items and populate product details
        const cartItems = await Cart.find({ user: req.user.id }).populate("product");
        
        // Check if the cart is empty
        if (cartItems.length === 0) {
            return res.json({ message: "Cart is empty, Order something" });
        }

        // Prepare order items with snapshots
        const orderItems = cartItems.map(item => ({
            product: item.product._id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.discountedPrice || item.product.price,
            image: item.product.images[0] || null
        }));

        // Calculate the total order amount
        const totalAmount = orderItems.reduce(
            (total, item) => total + item.price * item.quantity, 0);
        
        // Reduce stock for each product in the cart
        for (const item of cartItems) {
            await item.product.adjustStock(item.quantity); // Adjust stock for each product
        }

        // Create the order
        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            totalAmount,
            status: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Processing'
          });

        // Clear cart
        await Cart.deleteMany({ user: req.user.id });

        res.json({ message: 'Order created successfully', order })
        .status(201);
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

// Get user's orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate("items.product", "name images");
        res.status(200).json({ 
            message: "Success",
            totalOrder: orders.length,
            data: {
                orders
            }
        });
    } catch {
        res.status(500).json({ message: "Error fetching orders" })
    }
}


// Update order status (Admin only)
exports.updateOrderStatus = async ( req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
         // Find the order and update
         const order = await Order.findByIdAndUpdate(
            id, 
            { 
                status, 
                statusUpdatedAt: new Date() 
            },
            {
                new: true,
                runValidators: true
            }
        );

        // Check if order exists
        if (!order) {
            return res.status(404).json({ 
                message: "Order not found" 
            });
        }

         // Respond with success response
        res.status(200).json({
            message: "Order status updated successfully",
            data: {
                order: {
                    status: order.status,                }
            }
        });

    } catch {
        // Send an error response
        res.status(500).json({
            message: 'An unexpected error occurred while updating order status'
        });
    }
}

// Get single order details
exports.getOrder = async (req, res) => {
    try{
        // Check if the order exists
        if (!req.params.id) {
            return res.status(400).json({ 
                message: "Order ID is required" 
            });
        }
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate("items.product", "name images");

        if (!order) {
            return res.status(404).json({ 
                message: "No order found with that ID"
            });
        }

        res.status(200).json(order);

    } catch {
        res.status(500).json({ message: "Error fetching order" });
    }
}
