const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const userRoute = require("./Routes/user.routes");
const productRoute = require("./Routes/product.routes");
const cartRoute = require('./Routes/cart.routes');
const orderRoute = require('./Routes/order.routes');
const reviewRoute = require('./Routes/review.routes');


dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 6000;

mongoose
    .connect(process.env.DB_URL)
    .then(() => {
        console.log("Connected to database");
    })
    .catch((err) => {
        console.log("Something went wrong");
    });

app.use(userRoute);
app.use(productRoute);
app.use(cartRoute);
app.use(orderRoute);
app.use(reviewRoute);

app.listen(PORT, () => {
        console.log("App is running");
    });
