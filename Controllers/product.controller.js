const Product = require("../Models/product.model");

const allowedCategories = require("../Helpers/categoryHelper");


// Get all categories
exports.getCategories = async (req, res) => {
    try {
        res.json({ categories: allowedCategories }); // Send allowed categories to the client
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories'});
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    const { category } = req.params; // Get the category from the URL parameter
    try {
        // Validate the category
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        // Fetch products by category
        const products = await Product.find({ category });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products by category'});
    }
};


// Add a new product (Admin only)
exports.addProduct = async (req, res) => {
    const { name, description, price, category, stockQuantity } = req.body;

    try {
        const product = await Product.create({ name, description, price, category, stockQuantity });
        res.status(201).json({ message: 'Product added successfully', product });
    } catch (err) {
        res.status(400).json({ message: 'Error adding product', error: err.message });
    }
};

