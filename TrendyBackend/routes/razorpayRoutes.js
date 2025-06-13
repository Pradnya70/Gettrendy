const express = require("express")
const router = express.Router()

// Import controller functions
const {
  testRazorpay,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handlePaymentFailure,
  getPaymentDetails,
} = require("../controller/razorpayController")

// Simple auth middleware that passes through all requests
const simpleAuth = (req, res, next) => {
  console.log("Simple auth middleware called for:", req.path)
  if (!req.user) {
    req.user = { _id: "guest-user" }
  }
  next()
}

// Test route (no auth needed)
router.get("/test", testRazorpay)

// Routes with simple auth
router.post("/create-order", simpleAuth, createRazorpayOrder)
router.post("/verify-payment", simpleAuth, verifyRazorpayPayment)
router.post("/payment-failed", simpleAuth, handlePaymentFailure)
router.get("/payment/:paymentId", simpleAuth, getPaymentDetails)

module.exports = router
