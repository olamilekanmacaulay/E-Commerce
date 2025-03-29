const express = require("express");
const { addReview, updateReview, deleteReview} = require("../Controllers/review.controller");
const { authorization } = require("../Middleware/Authentication");

const router = express.Router();

// Add a review
router.post("/:productId", authorization, addReview);

// Update a review
router.put("/:productId", authorization, updateReview);

// Delete a review
router.delete("/:productId", authorization, deleteReview);

module.exports = router;