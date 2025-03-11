const jwt = require("jsonwebtoken");

// Protect routes (ensure user is authenticated)
exports.authorization = (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res
            .status(401)
            .json({ message: "You are not authorized to access this route" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Restrict access to admin users
exports.adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, admin only' });
    }
    next();
};