const express = require("express");
const { 
    register, 
    login, 
    updateUser, 
    deleteUser 
} = require("../Controllers/user.controller");
const { authorization, adminOnly } = require("../Middlewares/Authentication");
const router = express.Router();

// Register a user
router.post("/register", register);

// Login a user
router.post("/login", login);

// Update user details (Admin or the user themselves)
router.put("/users/:id", authorization, updateUser);

// Delete a user (Admin only)
router.delete("/users/:id", authorization, adminOnly, deleteUser);

module.exports = router;