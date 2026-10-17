const express = require("express");

const {
    getCategories,
    createCategory,
    deleteCategory
} = require("../controllers/categoryController.js");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware.js");


const router = express.Router();


router.get("/", getCategories);

router.post(
    "/",
    protect,
    adminOnly,
    createCategory
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteCategory
);


module.exports = router;