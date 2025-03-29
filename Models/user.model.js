const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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

module.exports = mongoose.model("User", userSchema);