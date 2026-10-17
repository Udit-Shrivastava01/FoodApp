const express = require("express");

const {
    register,
    login,
    getProfile
} = require("../controllers/authController.js");

const {
    protect
} = require("../middleware/authMiddleware.js");


const router = express.Router();


router.post("/register", register);

router.post("/login", login);

router.get("/profile", protect, getProfile);


module.exports = router;