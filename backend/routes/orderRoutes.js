const express = require("express");

const {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    getAllOrders
} = require("../controllers/orderController.js");

const {
    protect,
    adminMiddleware
} = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// Update status route protected by auth and admin middleware
router.put("/:id/status", protect, adminMiddleware, updateOrderStatus);

// Get all orders route protected by auth and admin middleware
router.get("/", protect, adminMiddleware, getAllOrders);

module.exports = router;