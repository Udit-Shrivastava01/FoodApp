const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const {
    connectDB
} = require("./config/db.js");


const authRoutes =
    require("./routes/authRoutes");

const productRoutes =
    require("./routes/productRoutes");

const restaurantRoutes =
    require("./routes/restaurantRoutes");

const categoryRoutes =
    require("./routes/categoryRoutes");

const cartRoutes =
    require("./routes/cartRoutes");

const orderRoutes =
    require("./routes/orderRoutes");

const paymentRoutes =
    require("./routes/paymentRoutes");

const reviewRoutes =
    require("./routes/reviewRoutes");

const feedbackRoutes =
    require("./routes/feedbackRoutes");

const deliveryRoutes =
    require("./routes/deliveryRoutes");


const app = express();


/* ================================
   MIDDLEWARE
================================ */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


/* ================================
   STATIC UPLOADS
================================ */

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


/* ================================
   HEALTH CHECK
================================ */

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "FoodApp backend is running"
    });

});


/* ================================
   API ROUTES
================================ */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/products",
    productRoutes
);

app.use(
    "/api/restaurants",
    restaurantRoutes
);

app.use(
    "/api/categories",
    categoryRoutes
);

app.use(
    "/api/cart",
    cartRoutes
);

app.use(
    "/api/orders",
    orderRoutes
);

app.use(
    "/api/payments",
    paymentRoutes
);

app.use(
    "/api/reviews",
    reviewRoutes
);

app.use(
    "/api/feedback",
    feedbackRoutes
);

app.use(
    "/api/delivery",
    deliveryRoutes
);


/* ================================
   404
================================ */

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });

});


/* ================================
   ERROR HANDLER
================================ */

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: err.message || "Internal server error"
    });

});


/* ================================
   START SERVER
================================ */

const PORT =
    process.env.PORT || 5000;


async function startServer() {

    await connectDB();


    app.listen(
        PORT,
        () => {

            console.log(
                `FoodApp server running on http://localhost:${PORT}`
            );

        }
    );
}


startServer();