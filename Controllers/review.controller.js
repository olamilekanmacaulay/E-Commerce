exports.addReview = async (req, res) => {
    const { productId } = req.params; // Product ID from the URL
    const { rating, comment } = req.body; // Rating and comment from the request body

    try {
        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if the user has already reviewed this product
        const existingReview = product.reviews.find(
            (review) => review.user.toString() === req.user.id
        );
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        // Add the review
        const newReview = {
            user: req.user.id,
            rating,
            comment,
        };
        product.reviews.push(newReview);

        // Update the product's average rating
        product.updateAverageRating();

        await product.save();

        res.status(201).json({ message: "Review added successfully", review: newReview });
    } catch (error) {
        res.status(500).json({ message: "Error adding review", error: error.message });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    const { productId } = req.params; // Product ID from the URL

    try {
        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Find the review by the user
        const reviewIndex = product.reviews.findIndex(
            (review) => review.user.toString() === req.user.id
        );
        if (reviewIndex === -1) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Remove the review
        product.reviews.splice(reviewIndex, 1);

        // Update the product's average rating
        product.updateAverageRating();

        await product.save();

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting review", error: error.message });
    }
};


// Update a review
exports.updateReview = async (req, res) => {
    const { productId } = req.params; // Product ID from the URL
    const { rating, comment } = req.body; // Updated rating and comment

    try {
        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Find the review by the user
        const review = product.reviews.find(
            (review) => review.user.toString() === req.user.id
        );
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Update the review
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        // Update the product's average rating
        product.updateAverageRating();

        await product.save();

        res.status(200).json({ message: "Review updated successfully", review });
    } catch (error) {
        res.status(500).json({ message: "Error updating review", error: error.message });
    }
};