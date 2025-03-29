const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    items: [{
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: true 
        },

        name: { 
            type: String,
            required: true 
        }, 

        quantity: { 
            type: Number, 
            required: true 
        },

        price: { 
            type: Number, 
            required: 
            true 
        },
        image: String
    }],

    totalAmount: { 
        type: Number, 
        required: true 
    },

    status: { 
        type: String, 
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded" ], 
        default: 'Pending' 
    },

    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        contactNumber: { type: String, required: true }
    },

    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);