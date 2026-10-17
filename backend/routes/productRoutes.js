const express = require("express");

const {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct
} = require("../controllers/productController.js");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware.js");

const upload = require("../middleware/uploadMiddleware.js");


const router = express.Router();


router.get("/", getProducts);

router.get("/:id", getProductById);


router.post(
    "/",
    protect,
    adminOnly,
    upload.single("product_image"),
    createProduct
);


router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteProduct
);


module.exports = router;