const Product = require("../Models/product.model");

const { formatProductResponse } = require("../Helpers/CleanProductResponse");

const allowedCategories = require("../Helpers/categoryHelper");


// Get all categories
exports.getCategories = async (req, res) => {
    try {
        res.json({ categories: allowedCategories }); // Send allowed categories to the client
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories'});
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().lean();

        const productResponse = products.map(product => ({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stockQuantity: product.stockQuantity,
            images: product.images,
            reviews: product.reviews,
            ratings: product.ratings,
            discountPercentage: product.discountPercentage,
        }));

        res.status(200).json({ message: "Products retrieved successfully", products: productResponse });
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id).lean();
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        cleanProduct = formatProductResponse(product);
        res.status(200).json({ 
            message: "Product retrieved successfully", 
            product: cleanProduct
    });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product "});
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    const { category } = req.params; // Get the category from the URL parameter
    try {
        // Validate the category
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        // Fetch products by category
        const products = await Product.find({ category });

        const productResponse = products.map(product => ({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stockQuantity: product.stockQuantity,
            images: product.images.map((image) => ({
                url: image.url,
                isMain: image.isMain,
            })),
            reviews: product.reviews,
            ratings: product.ratings,
            discountPercentage: product.discountPercentage,
        }));

        res.status(200).json({ message: "Products retrieved successfully", products: productResponse });
    } catch (err) {
        res.status(500).json({ message: "Error fetching products by category"});
    }
};


// Add a new product (Admin only)
exports.addProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ message: "Product added successfully", product });
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(400).json({ message: "Error adding product" });
    }
};


// Update a product (Admin only)
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Create a clean response object
        const cleanProduct = formatProductResponse(product);

        res.status(200).json({
            message: "Product updated successfully",
            product: cleanProduct,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Error updating product" });
    }
};

// Delete a product (Admin only)
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Error deleting product" });
    }
};