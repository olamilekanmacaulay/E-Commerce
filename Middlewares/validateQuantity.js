module.exports = (req, res, next) => {
    const { quantity } = req.body;

    // Convert quantity to integer
    const quantityInt = parseInt(quantity, 10);
    if (isNaN(quantityInt) || quantityInt < 1) {
        //
        return res.status(400).json({ message: "Invalid quantity" });
    }

    // Attach the validated quantity to the request object
    req.body.quantity = quantityInt;

    next(); 
};