const express = require("express");

const {
    getPaymentByOrder
} = require("../controllers/paymentController.js");

const {
    protect
} = require("../middleware/authMiddleware.js");


const router = express.Router();


router.get(
    "/order/:orderId",
    protect,
    getPaymentByOrder
);


module.exports = router;