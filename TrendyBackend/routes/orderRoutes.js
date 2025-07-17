const express = require("express")
const router = express.Router()
const orderController = require("../controller/orderController")
const { auth, adminAuth } = require("../middleware/auth")

// User routes
router.post("/place", auth, orderController.placeOrder)
router.get("/myorders", auth, orderController.getUserOrders)
router.get("/:orderId", auth, orderController.getOrderById)

// Admin routes
router.put("/:orderId/status", adminAuth, orderController.updateOrderStatus)

module.exports = router
