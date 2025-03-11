const Product = require("../Models/product.model");

// Add stock to a product
exports.addStock = async (req, res) => {
    const { productId, quantity } = req.body;

    //convert quantity to integer
    const quantityInt = parseInt(quantity);
    if (isNaN(quantityInt)){
        return res.status(400).json({ messaage: "Invalid quantity" });
    }

    try {
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Increase stock quantity
        product.stockQuantity += Int(quantityInt); 
        await product.save();
        res.json({ message: 'Stock updated successfully', product });
    } catch (err) {
        res.status(400).json({ message: 'Error updating stock' });
    }
};

// Reduce stock (used when an order is placed)
exports.reduceStock = async (productId, quantity) => {

    //convert quantity to integer
    const quantityInt = parseInt(quantity);
    if (isNaN(quantityInt)){
        return res.status(400).json({ messaage: "Invalid quantity" });
    }

    try {
        
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        //Check if there is enough stock
        if (product.stockQuantity < quantity) {
            throw new Error('Insufficient stock');
        }

        product.stockQuantity -= quantityInt; // Reduce stock quantity
        await product.save();
    } catch (err) {
        throw new Error("Error reducing stock");
    }
};