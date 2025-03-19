const allowedCategories = require("../Helpers/categoryHelper");

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    category: { 
        type: String, 
        required: true, 
        enum: allowedCategories // Restricted to allowed categoried
    },
    stockQuantity: { 
        type: Number, 
        required: true, 
        default: 0 
    },
}, { timestamps: true });


module.exports = mongoose.model("Product", productSchema);