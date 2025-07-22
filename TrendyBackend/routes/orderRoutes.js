const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");
const { auth, adminAuth } = require("../middleware/auth");
const shiprocketService = require("../services/shiprocketService");

// User routes
router.post("/place", auth, orderController.placeOrder);
router.get("/myorders", auth, orderController.getUserOrders);
router.get("/:orderId", auth, orderController.getOrderById);

// Admin routes
router.put("/:orderId/status", adminAuth, orderController.updateOrderStatus);
router.get("/user/:userId", orderController.getOrdersByUser);
router.get("/", adminAuth, orderController.getAllOrders);
router.put(
  "/user/:userId/mark-seen",
  adminAuth,
  orderController.markOrdersAsSeen
);

// Receipt download route
router.get("/receipt/:orderId", orderController.downloadReceipt);

router.post("/shiprocket-order", orderController.createShiprocketOrder);

module.exports = router;
