const User = require("../Models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


// Register a new user.
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const isUser = await User.findOne({ email });
    if (isUser) {
    return res
        .status(400)
        .send("user already exists");
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
        const user = await User.findOne({ email });
        // Validate the inputted password
        if (!user || !(await user.matchPassword(password))) {
            return res.status(400).json({message: "Invalid credentials" });
        }
        // Create a token of the user
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn:"1h" });
        return res
        .cookie("token", token, { httpOnly: true })
        .status(200)
        .json(user);

    } catch (error) {
        res.status(400).send("Error loggin in")
    }
};