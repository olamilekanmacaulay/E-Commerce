const allowedCategories = require("../Helpers/categoryHelper");

const mongoose = require("mongoose");
const reviewSchema = require("./review.model");

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        trim: true,
        required: [true, "Product name is required"],
        maxlength: [100, "Product name cannot exceed 100 characters"]
    },

    description: { 
        type: String, 
        required: [true, "Product description is required"] 
    },

    price: { 
        type: Number, 
        required: [true, "Product price is required"], 
    },

    discountedPrice: {
        type: Number,
        min: [0, 'Discounted price cannot be negative'],
        validate: {
          validator: function(value) {
            return value < this.price;
          },
          message: "Discounted price must be less than regular price"
        }
      },

    category: { 
        type: String, 
        required: true, 
        enum: {
            values: allowedCategories,
            message: "Please select a valid category" // Restricted to allowed categories
        }
    },

    stockQuantity: { 
        type: Number, 
        required: [true, "Product stock is required"],
        min: [0, "stock cannot be negative"], 
        default: 0 
    },

    images: [{
        url: String,
        isMain: {
            type: Boolean,
            default: false
        } 
    }],
    
    reviews: [reviewSchema],

    ratings: {
        average: {
            type: Number,
            default: 0,
            min: [0, "Rating must be at least 0"],
            max: [5, "Rating cannot exceed 5"]
        },
        count: {
            type: Number,
            default: 0,
        }
    },

}, { 
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// Add virtual property to check if product is on sale
productSchema.virtual("onSale").get(function() {
    return this.discountedPrice && this.discountedPrice < this.price;
});
  
// Add virtual property for discount percentage
productSchema.virtual("discountPercentage").get(function() {
    if (!this.discountedPrice || this.discountedPrice >= this.price) 
        return 0;
    return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
});

// Update average rating when new reviews are added
productSchema.methods.updateAverageRatings = function() {

    if (this.reviews.length === 0) {
      this.ratings.average = 0;
      this.ratings.count = 0;
      return;
    }
    
    const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
    this.ratings.average = sum / this.reviews.length;
    this.ratings.count = this.reviews.length;
};

// Post hook to update average ratings after review operations
productSchema.post(/^findOneAnd/, async function (doc) {
    if (doc) {
        // Re-fetch the full document using doc.constructor
        const product = await doc.constructor.findById(doc._id);
        if (product) {
            await product.updateAverageRatings(); // Call the instance method
            await product.save(); // Save the updated ratings
        }
    }
});

productSchema.pre("save", function (next) {
    if (this.discountedPrice >= this.price) {
        this.discountedPrice = undefined; // Reset discountedPrice if invalid
    }
    next();
});

productSchema.methods.adjustStock = async function (quantity) {
    if (this.stockQuantity < quantity) {
        throw new Error("Insufficient stock");
    }
    this.stockQuantity -= quantity;
    await this.save();
};

module.exports = mongoose.model("Product", productSchema);