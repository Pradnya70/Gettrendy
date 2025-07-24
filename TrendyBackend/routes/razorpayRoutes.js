const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth") // Import the proper auth middleware

// Import controller functions
const {
  testRazorpay,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handlePaymentFailure,
  getPaymentDetails,
} = require("../controller/razorpayController")

// Test route (no auth needed)
router.get("/test", testRazorpay)

// Routes with proper authentication
router.post("/create-order", auth, createRazorpayOrder)
router.post("/verify-payment", auth, verifyRazorpayPayment)
router.post("/payment-failed", auth, handlePaymentFailure)
router.get("/payment/:paymentId", auth, getPaymentDetails)

module.exports = router
