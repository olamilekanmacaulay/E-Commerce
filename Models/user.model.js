const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Cart = require("./cart.model"); // Cart model
const Review = require("./review.model"); // Review model

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },

    email: { 
        type: String, 
        required: [true,"Please provide your email"],
        unique: true,
        lowercase: true,
        trim: true
    },

    password: { 
        type: String, 
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false
    },

    photo: {
        type: String,
        default: 'default.jpg'
    },

    role: { 
        type: String, 
        enum: ["user", "admin"], 
        default: "user" 
    },
}, {timestamps: true });


// Pre-save middleware to hash the password before saving the user.
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next(); // Skip if the password is not modified

    try {
        // Hash the password
        this.password = await bcrypt.hash(this.password, 10);
        return next();
    } catch (error) {
        return next(error);
    }
});

// Method to compare the entered password with the hashed password in the database.
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); // Uses bcrypt to compare the passwords.
};


// Post middleware to delete cart after a user is deleted
userSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        try {
            // Delete the user's cart (E-Commerce API)
            await Cart.deleteOne({ user: doc._id });
            
            // Delete all reviews associated with the user
            await Review.deleteMany({ user: doc._id });

            console.log(`User ${doc.username} and their associated cart have been deleted.`);
        } catch (error) {
            console.error(`Error deleting cart for user: ${doc._id}`, error);
        }
    }
});

module.exports = mongoose.model("User", userSchema);