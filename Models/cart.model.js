const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, "Cart must belong to a user"],
        unique: true
    },

    item: [{
        product: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: true 
        },

        quantity: { 
            type: Number, 
            required: true,
            min: [1, 'Quantity must be at least 1'],
            default: 1
        }
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true } 
});

// Virtual populate with price data
cartSchema.virtual('itemsWithPrices', {
    ref: 'Product',                  // Reference the Product model
    localField: 'items.product',     // Field in Cart model to match
    foreignField: '_id',             // Field in Product model to match
    options: { 
        select: "name price discountedPrice"  // Only include these fields
    }
});

// Calculate totals using LIVE product prices
cartSchema.virtual('subtotal').get(async function() {
    // 1. First populate the virtual relationship
    await this.populate('itemsWithPrices');
    
    // 2. Calculate total
    return this.items.reduce((sum, item, index) => {
      const product = this.itemsWithPrices[index]; // Get corresponding product
      const price = product.discountedPrice || product.price; // Use discounted if available
      return sum + (price * item.quantity); // Accumulate total
    }, 0);
  });

module.exports = mongoose.model('Cart', cartSchema);