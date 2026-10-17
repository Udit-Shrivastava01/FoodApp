const express = require("express");

const {
    getCart,
    addToCart,
    updateCart,
    removeFromCart
} = require("../controllers/cartController.js");

const {
    protect
} = require("../middleware/authMiddleware.js");


const router = express.Router();


router.get(
    "/",
    protect,
    getCart
);


router.post(
    "/",
    protect,
    addToCart
);


router.put(
    "/:id",
    protect,
    updateCart
);


router.delete(
    "/:id",
    protect,
    removeFromCart
);


module.exports = router;