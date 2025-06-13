const express = require('express');
const router = express.Router();
const { stripePayment, razorpayPayment } = require('../controller/paymentController');

router.post('/stripe', stripePayment);  // Stripe payment processing
router.post('/razorpay', razorpayPayment);  // Razorpay payment processing

module.exports = router;
