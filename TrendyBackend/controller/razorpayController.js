const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");

// Test endpoint to check if controller is working
const testRazorpay = async (req, res) => {
  try {
    console.log("Test endpoint called");
    console.log("Environment variables:");
    console.log(
      "- RAZORPAY_KEY_ID:",
      process.env.RAZORPAY_KEY_ID ? "Present" : "Missing"
    );
    console.log(
      "- RAZORPAY_KEY_SECRET:",
      process.env.RAZORPAY_KEY_SECRET ? "Present" : "Missing"
    );

    res.json({
      success: true,
      message: "Test endpoint working",
      environment: {
        razorpay_key_id: process.env.RAZORPAY_KEY_ID ? "Present" : "Missing",
        razorpay_key_secret: process.env.RAZORPAY_KEY_SECRET
          ? "Present"
          : "Missing",
      },
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Test endpoint failed",
      error: error.message,
    });
  }
};

// Create Razorpay order
const createRazorpayOrder = async (req, res) => {
  try {
    console.log("=== CREATE RAZORPAY ORDER START ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Request headers:", JSON.stringify(req.headers, null, 2));

    // Check environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay credentials");
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials not configured",
        debug: {
          key_id: process.env.RAZORPAY_KEY_ID ? "Present" : "Missing",
          key_secret: process.env.RAZORPAY_KEY_SECRET ? "Present" : "Missing",
        },
      });
    }

    // Validate request body
    const { amount, currency = "INR", receipt } = req.body;

    console.log("Extracted values:");
    console.log("- amount:", amount);
    console.log("- currency:", currency);
    console.log("- receipt:", receipt);

    if (!amount || amount <= 0) {
      console.error("Invalid amount:", amount);
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
        received_amount: amount,
      });
    }

    // Initialize Razorpay
    console.log("Initializing Razorpay...");
    let razorpay;
    try {
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      console.log("Razorpay instance created successfully");
    } catch (razorpayError) {
      console.error("Failed to create Razorpay instance:", razorpayError);
      return res.status(500).json({
        success: false,
        message: "Failed to initialize payment gateway",
        error: razorpayError.message,
      });
    }

    // Prepare order options
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    console.log("Order options:", JSON.stringify(options, null, 2));

    // Create order with Razorpay
    console.log("Calling Razorpay API...");
    const order = await razorpay.orders.create(options);

    console.log(
      "Razorpay order created successfully:",
      JSON.stringify(order, null, 2)
    );

    const response = {
      success: true,
      message: "Order created successfully",
      order: order,
      key_id: process.env.RAZORPAY_KEY_ID,
    };

    console.log("Sending response:", JSON.stringify(response, null, 2));
    console.log("=== CREATE RAZORPAY ORDER END ===");

    res.status(200).json(response);
  } catch (error) {
    console.error("=== CREATE RAZORPAY ORDER ERROR ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    let errorMessage = "Failed to create payment order";
    let statusCode = 500;

    if (error.statusCode === 401) {
      errorMessage = "Invalid Razorpay credentials";
      console.error("Authentication failed with Razorpay");
    } else if (error.statusCode === 400) {
      errorMessage = "Invalid order parameters";
      statusCode = 400;
      console.error("Bad request to Razorpay API");
    }

    const errorResponse = {
      success: false,
      message: errorMessage,
      error: error.message,
      statusCode: error.statusCode,
      debug:
        process.env.NODE_ENV === "development"
          ? {
              stack: error.stack,
              razorpay_error: error,
            }
          : undefined,
    };

    console.log(
      "Sending error response:",
      JSON.stringify(errorResponse, null, 2)
    );
    console.log("=== CREATE RAZORPAY ORDER ERROR END ===");

    res.status(statusCode).json(errorResponse);
  }
};

// Verify Razorpay payment
const verifyRazorpayPayment = async (req, res) => {
  try {
    console.log("verifyRazorpayPayment req.body:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification parameters",
      });
    }

    // Create signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error("Payment signature verification failed");
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    console.log("Payment signature verified successfully");
    console.log("razorpay_order_id received:", razorpay_order_id);

    // Create order in database
    const newOrder = new Order({
      orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      userId: req.user ? req.user._id : "guest-user",
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      paymentMethod: "RAZORPAY",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      orderStatus: "processing",
      address: orderData.address,
      notes: orderData.notes,
    });

    const savedOrder = await newOrder.save();

    console.log("Order created successfully:", savedOrder._id);

    res.status(200).json({
      success: true,
      message: "Payment verified and order created successfully",
      order: savedOrder,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Handle payment failure
const handlePaymentFailure = async (req, res) => {
  try {
    console.log("Handling payment failure...");
    const { error, orderData } = req.body;
    console.log("Payment failed:", error);

    res.status(400).json({
      success: false,
      message: "Payment failed",
      error: error,
    });
  } catch (error) {
    console.error("Error handling payment failure:", error);
    res.status(500).json({
      success: false,
      message: "Error handling payment failure",
    });
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    console.log("Getting payment details...");

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment: payment,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message,
    });
  }
};

module.exports = {
  testRazorpay,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handlePaymentFailure,
  getPaymentDetails,
};
