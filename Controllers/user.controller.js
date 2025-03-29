const User = require("../Models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


// Register a new user.
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
    if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    // Check if user already exists
    const isUser = await User.findOne({ email });
    if (isUser) {
    return res
        .status(400)
        .send("User already exists");
    }

    // Create the user
    try {
        const user = await User.create({ ...req.body });
        res.status(201)
            .json({ message: "User created successfully",});
    } catch (error) {
        res.status(400)
            .json({message: "Error creating user", 
        });
    }
};

// Login a user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }
                
        // Validate the inputted password

        if (!(await user.matchPassword(password))) {
            return res.status(400).json({ message: "Invalid password" });
        }
        // Create a token of the user
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn:"3h" });
        return res
        .cookie("token", token, { httpOnly: true })
        .status(200)
        .json({
            username: user.username,
            email: user.email,
            photo: user.photo,
            role: user.role,
        });

    } catch (error) {
        console.error("Error logging in:", error); // Log the error
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

// Update user details
exports.updateUser = async (req, res) => {
    const { id } = req.params; // User ID from the URL
    const { username, email, password } = req.body; // Fields to update

    try {
        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user fields
        if (username) user.username = username;
        if (email) user.email = email;
        if (password) user.password = password; 

        await user.save();

        res.status(200).json({ message: "User updated successfully", data: {
            username: user.username,
            email: user.email,
            photo: user.photo,
            role: user.role
        } });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    const { id } = req.params; // User ID from the URL

    try {
        // Find and delete the user
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};