const Cart = require("../Models/cart.model");
const Product = require("../Models/product.model");

//add product to cart

exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    
    // Convert quantity to integer
    const quantityInt = parseInt(quantity, 10);
    if (isNaN(quantityInt)) {
        return res.status(400).json({ message: 'Invalid quantity' });
    }
    
    try {

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.send("Product not found");
        }

        // Check if the product is out of stock
        if (product.stockQuantity === 0) {
            return res.status(400).json({ message: 'This product is out of stock' });
        }

        // Check if the requested quantity is available
        if (product.stockQuantity < quantityInt) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Check if the product is already in the user's cart
        const cartItem = await Cart.findOne({ user: req.user.id, product: productId });
        if (cartItem) {
            
            // If the product is already in the cart, update the quantity
            cartItem.quantity += quantityInt;
        } else {
           
            // If the product is not in the cart, create a new cart item
            const cartItem = await Cart.create({ user: req.user.id, product: productId, quantityInt });
        }
        await cartItem.save();
        res.send("product added to cart", cartItem);
    } catch {
        res.status(400).json({ message: "Error adding to cart" });
    }
};

// Get user's cart 
exports.getCart = async (req, res) => {
    try {
        const cartItems = await Cart.find({ user: req.user.id }).populate("product");
        res.json(cartItems)
    } catch (error) {
        res.send("Error fetching cart");
    }
}