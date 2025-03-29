const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    },

    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },

    comment: {
        type: String,
        required: [true, 'Please provide a review comment'],
        trim: true,
        maxlength: [500, 'Review cannot exceed 500 characters']
  },
  createdAt: {
        type: Date,
        default: Date.now
  }
}, {
    // Schema options for embedded documents
    id: false, // Disable duplicate `id` virtual
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true }
});
  
// Prevent duplicate reviews from the same user (for embedded)
reviewSchema.index({ user: 1, product: 1}, { unique: true });
  
// Virtual populate user details (optional)
reviewSchema.virtual('userDetails', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true,
    options: { select: 'name email photo' }
});
  
module.exports = reviewSchema;