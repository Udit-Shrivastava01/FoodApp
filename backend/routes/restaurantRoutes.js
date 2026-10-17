const express = require("express");

const {
    getRestaurants,
    getRestaurantById,
    createRestaurant
} = require("../controllers/restaurantController.js");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware.js");

const upload = require("../middleware/uploadMiddleware.js");


const router = express.Router();


router.get("/", getRestaurants);

router.get("/:id", getRestaurantById);


router.post(
    "/",
    protect,
    adminOnly,
    upload.single("image"),
    createRestaurant
);


module.exports = router;