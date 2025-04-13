const express = require("express");
const { addReview, updateReview, deleteReview} = require("../Controllers/review.controller");
const { authorization } = require("../Middlewares/Authentication");

const router = express.Router();

// Add a review
router.post("/product/review/add/:productId", authorization, addReview);

// Update a review
router.put("/product/review/update/:productId", authorization, updateReview);

// Delete a review
router.delete("/product/review/delete/:productId", authorization, deleteReview);

module.exports = router;