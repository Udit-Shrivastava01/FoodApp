const express = require("express");

const {
    getDeliveryPartners,
    createDeliveryPartner,
    updateAvailability
} = require("../controllers/deliveryController.js");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware.js");


const router = express.Router();


router.get(
    "/",
    protect,
    adminOnly,
    getDeliveryPartners
);


router.post(
    "/",
    protect,
    adminOnly,
    createDeliveryPartner
);


router.put(
    "/:id/availability",
    protect,
    updateAvailability
);


module.exports = router;