const express = require("express");

const {
    createFeedback,
    getFeedback
} = require("../controllers/feedbackController.js");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware.js");


const router = express.Router();


router.post(
    "/",
    protect,
    createFeedback
);


router.get(
    "/",
    protect,
    adminOnly,
    getFeedback
);


module.exports = router;