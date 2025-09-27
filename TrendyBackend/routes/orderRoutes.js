const express = require("express")
const router = express.Router()
const orderController = require("../controller/orderController")
const { auth, adminAuth } = require("../middleware/auth")

// User-specific routes
router.post("/place", auth, orderController.placeOrder)
router.get("/myorders", auth, orderController.getUserOrders)
router.get("/replacements/my", auth, orderController.getMyReplacementRequests)
router.post("/return/:orderId", auth, orderController.createReplacementRequest)

// Admin routes
router.get("/replacements", adminAuth, orderController.getReplacementRequests)
router.put("/replacements/:id/status", adminAuth, orderController.updateReplacementStatus)

// Other user/admin routes
router.get("/user/:userId", orderController.getOrdersByUser)
router.put("/user/:userId/mark-seen", adminAuth, orderController.markOrdersAsSeen)
router.get("/admin/unseen-count", adminAuth, orderController.getUnseenOrdersCount)
router.get("/", adminAuth, orderController.getAllOrders)

router.get("/receipt/:orderId", orderController.downloadReceipt)
router.post("/shiprocket-order", orderController.createShiprocketOrder)

// Specific order updates
router.put("/:orderId/status", adminAuth, orderController.updateOrderStatus)

// Catch-all get order by id (keep last)
router.get("/:orderId", auth, orderController.getOrderById)

module.exports = router
