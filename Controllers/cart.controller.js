const Cart = require("../Models/cart.model");
const Product = require("../Models/product.model");

//add product to cart

exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    
    try {

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(400).json({ message: "Product not found"});
        }

        // Check if the product is out of stock
        if (product.stockQuantity === 0) {
            return res.status(400).json({ message: "This product is out of stock" });
        }

        // Check if the requested quantity is available
        if (product.stockQuantity < quantity) {
            return res.status(400).json({ 
                message: "Insufficient stock",
                availableQuantity: product.stockQuantity
             });
        }

        // Adjust stock
        await product.adjustStock(quantity);

        
        // Find user's cart or create new one
        const cartItem = await Cart.findOneAndUpdate(
            { user: req.user.id },  // Filter by UserID
            { $setOnInsert: { user: req.user.id, item: [] } }, // Create new cart if it doesn't exist
            { new: true, upsert: true } // Return the updated or newly created document
        );

        // Check if product exists in cart items
        const itemIndex = cartItem.item.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex !== -1) {
            // Update existing item quantity
            cartItem.item[itemIndex].quantity += quantity;
        } else {
            // Add new item
            cartItem.item.push({
                product: productId,
                quantity
            });
        }

        await cartItem.save();
    
        // Populate product details for response
        await cartItem.populate({
            path: "item.product",
            select: "name price discountedPrice images"
        });

        const cleanCart = {
            user: cartItem.user,
            items: cartItem.item
                .filter(item => item.product !== null) // Exclude items with null products
                .map((item) => ({
                    product: {
                        name: item.product.name,
                        price: item.product.price,
                        discountedPrice: item.product.discountedPrice || item.product.price,
                        images: item.product.images.map(image => ({
                            url: image.url,
                            isMain: image.isMain,
                        })), // Include only url and isMain
                    },
                    quantity: item.quantity,
                })),
            subtotal: cartItem.item
                .filter(item => item.product !== null) // Exclude items with null products
                .reduce((sum, item) => {
                    const price = item.product.discountedPrice || item.product.price;
                    return sum + price * item.quantity;
                }, 0),
        };

        res.status(200).json({
            message: "Product added to cart",
            cart: cleanCart,
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ 
            message: "Error adding to cart", 
        });
    }
};

// Get user's cart with calculated totals
exports.getCart = async (req, res) => {
    try {
        // Find the user's cart
        const cartItem = await Cart.findOne({ user: req.user.id }).populate({
            path: "item.product",
            select: "name price discountedPrice images stockQuantity"
        });


        if (!cartItem) {
            return res.status(200).json({ message: "Your cart is empty" });
        }

        // Filter out items with null products
        cartItem.item = cartItem.item.filter(item => item.product !== null);

        // Calculate subtotal
        const subtotal = cartItem.item.reduce((sum, item) => {
            const price = item.product.discountedPrice || item.product.price;
            return sum + (price * item.quantity);
        }, 0);

        // Create a clean response object
        const cleanCart = {
            user: cartItem.user,
            items: cartItem.item
                .map((item) => ({
                    product: {
                        name: item.product.name,
                        price: item.product.price,
                        discountedPrice: item.product.discountedPrice || item.product.price,
                        images: item.product.images.map(image => ({
                            url: image.url,
                            isMain: image.isMain,
                        })), // Include only url and isMain
                    },
                    quantity: item.quantity,
                })),
            subtotal,
        };
        res.status(200).json({
            message: "Cart retrieved successfully",
            cart: cleanCart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Error fetching cart",
        });
    }
};

//Update cart Item Qunatity
exports.updateCartItem = async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    try {
        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check stock
        if (product.stockQuantity < quantity) {
            return res.status(400).json({ 
                message: "Insufficient stock", 
                availableQuantity: product.stockQuantity 
            });
        }

        // Find user's cart
        const cartItem = await Cart.findOne({ user: req.user.id });
        if (!cartItem) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Filter out items with null products
        cartItem.item = cartItem.item.filter(item => item.product !== null);

        // Find the item in cart
        const itemIndex = cartItem.item.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        const currentQuantity = cartItem.item[itemIndex].quantity;

        // Adjust stock based on the difference in quantity
        if (quantity > currentQuantity) {
            await product.adjustStock(quantity - currentQuantity);
        } else if (quantity < currentQuantity) {
            product.stockQuantity += currentQuantity - quantity;
            await product.save();
        }

        // Update quantity
        cartItem.item[itemIndex].quantity = quantity;
        await cartItem.save();

        // Populate for response
        await cartItem.populate({
            path: "item.product",
            select: "name price discountedPrice images"
        });

        // Create a clean response object
        const cleanCart = {
            user: cartItem.user,
            items: cartItem.item
            .filter(item => item.product !== null)
            .map((item) => ({
                product: {
                    name: item.product.name,
                    price: item.product.price,
                    discountedPrice: item.product.discountedPrice || item.product.price,
                    images: item.product.images.map(image => ({
                        url: image.url,
                        isMain: image.isMain,
                    })),
                },
                quantity: item.quantity,
            })),
            subtotal: cartItem.item
            .filter(item => item.product !== null)
            .reduce((sum, item) => {
                const price = item.product.discountedPrice || item.product.price;
                return sum + price * item.quantity;
            }, 0),
        };

        res.status(200).json({
            message: "Cart updated successfully",
            cleanCart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Error updating cart", 
            error: error.message 
        });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    const { productId } = req.params;

    try {
        // Find user's cart
        const cartItem = await Cart.findOne({ user: req.user.id });
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Filter out the item to remove
        cartItem.item = cartItem.item.filter(
            item => item.product.toString() !== productId
        );

        await cartItem.save();

        // If cart is empty, you might want to delete it
        if (cartItem.item.length === 0) {
            await Cart.findByIdAndDelete(cart._id);
            return res.status(200).json({ 
                message: "Item removed and cart is now empty",
                cart: null
            });
        }

        // Populate for response
        await cartItem.populate({
            path: "item.product",
            select: "name price discountedPrice images"
        });

        const cleanCart = {
            user: cartItem.user,
            items: cartItem.item
            .filter(item => item.product !== null)
            .map((item) => ({
                product: {
                    name: item.product.name,
                    price: item.product.price,
                    discountedPrice: item.product.discountedPrice || item.product.price,
                    images: item.product.images.map(image => ({
                        url: image.url,
                        isMain: image.isMain,
                    })),
                },
                quantity: item.quantity,
            })),
            subtotal: cartItem.item
            .filter(item => item.product !== null)
            .reduce((sum, item) => {
                const price = item.product.discountedPrice || item.product.price;
                return sum + price * item.quantity;
            }, 0),
        };

        res.status(200).json({
            message: "Item removed from cart successfully",
            cleanCart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Error removing item from cart", 
            error: error.message
        });
    }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
    try {
        const result = await Cart.findOneAndDelete({ user: req.user.id });
        
        if (!result) {
            return res.status(200).json({ message: "Cart was already empty" });
        }

        res.status(200).json({ message: "Cart cleared successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Error clearing cart", 
            error: error.message 
        });
    }
};
