const express = require("express");

const {
    addReview,
    getProductReviews
} = require("../controllers/reviewController.js");

const {
    protect
} = require("../middleware/authMiddleware.js");


const router = express.Router();


router.get(
    "/product/:productId",
    getProductReviews
);


router.post(
    "/product/:productId",
    protect,
    addReview
);


module.exports = router;