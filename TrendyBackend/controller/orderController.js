const Order = require("../models/Order")
const Cart = require("../models/Cart")
const User = require("../models/User")
const Product = require("../models/Product")
const mongoose = require("mongoose")
const PDFDocument = require("pdfkit")
const shiprocketService = require("../services/shiprocketService")
const { sendOrderConfirmationToUser, sendNewOrderNotificationToAdmin } = require("../services/emailService")
const crypto = require("crypto")
const ReplacementRequest = require("../models/ReplacementRequest")

// ===============================
// PLACE ORDER
// ===============================
const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id
    const { items, totalAmount, paymentMethod, address, notes } = req.body

    // ✅ Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order items are required" })
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid total amount is required" })
    }
    if (!address || !address.fullName || !address.street || !address.city || !address.phone) {
      return res.status(400).json({ success: false, message: "Complete address information is required" })
    }

    // ✅ Get user
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    // ✅ Validate products
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ success: false, message: `Invalid product ID: ${item.productId}` })
      }
      const product = await Product.findById(item.productId)
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.productName}` })
    }

    // ✅ Generate order ID
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`

    // ✅ Create order in DB
    const order = new Order({
      orderId,
      userId,
      userName: user.name,
      userEmail: user.email,
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
        size: i.size || "M",
        color: i.color || "Default",
      })),
      totalAmount,
      paymentMethod: paymentMethod || "CASH",
      paymentStatus: paymentMethod === "CASH" ? "paid" : "pending",
      status: "pending",
      address: {
        fullName: address.fullName,
        street: address.street,
        apartment: address.apartment || "",
        city: address.city,
        state: address.state || "",
        postcode: address.postcode,
        phone: address.phone,
        email: address.email,
        country: address.country || "India",
      },
      notes: notes || "",
    })

    await order.save()

    // ✅ COD Orders → Immediately confirm + Shiprocket
    if (paymentMethod === "CASH") {
      try {
        const emailToSend = address.email || user.email
        await sendOrderConfirmationToUser(emailToSend, order)
        await sendNewOrderNotificationToAdmin(order)
        order.userEmailSent = true
        order.adminEmailSent = true
        order.userNotified = true
        order.adminNotified = true
        await order.save()
      } catch (err) {
        console.error("Email error:", err.message)
      }

      try {
        const shiprocketPayload = {
         order_id: order.orderId,
    order_date: new Date().toISOString(),
    pickup_location: "warehouse", // must match your Shiprocket pickup
    billing_customer_name: String(order.address.fullName),
    billing_last_name: "",
    billing_address: String(order.address.street),
    billing_city: String(order.address.city),
    billing_pincode: String(order.address.postcode),
    billing_state: String(order.address.state),
    billing_country: String(order.address.country),
    billing_email: String(order.address.email),
    billing_phone: String(order.address.phone),
    order_items: order.items.map((i) => ({
      name: String(i.productName),
      sku: typeof i.productId === "object" && i.productId !== null && i.productId._id
        ? String(i.productId._id)
        : String(i.productId),
      units: Number(i.quantity),
      selling_price: Number(i.price),
    })),
    payment_method: "COD",
    sub_total: Number(order.totalAmount),
    length: 10,
          breadth: 10,
          height: 10,
          weight: 1.0,
        }

        const shipRes = await shiprocketService.createOrder(shiprocketPayload)
        if (shipRes?.order_id) {
          order.shiprocketOrderId = shipRes.order_id
          order.shiprocketShipmentId = shipRes.shipment_id
          order.trackingNumber = shipRes.awb_code
          await order.save()
        }
      } catch (shipErr) {
        console.error("Shiprocket sync error:", shipErr.message)
      }
    }

    // ✅ Clear cart
    await Cart.findOneAndDelete({ userId })

    res.status(201).json({
      success: true,
      message: paymentMethod === "CASH" ? "COD order placed successfully" : "Online order created (awaiting payment)",
      data: order,
      orderId: order.orderId,
    })
  } catch (error) {
    console.error("Place order error:", error)
    res.status(500).json({ success: false, message: "Error placing order", error: error.message })
  }
}

// ===============================
// VERIFY RAZORPAY PAYMENT
// ===============================
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

    // ✅ Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex")

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Invalid Razorpay signature" })
    }

    // ✅ Update order
    const order = await Order.findOne({ orderId })
    if (!order) return res.status(404).json({ success: false, message: "Order not found" })

    order.paymentStatus = "paid"
    order.razorpayOrderId = razorpayOrderId
    order.razorpayPaymentId = razorpayPaymentId
    order.razorpaySignature = razorpaySignature
    await order.save()

    // ✅ Send Emails
    const emailToSend = order.address.email || order.userEmail
    await sendOrderConfirmationToUser(emailToSend, order)
    await sendNewOrderNotificationToAdmin(order)
    order.userEmailSent = true
    order.adminEmailSent = true
    order.userNotified = true
    order.adminNotified = true
    await order.save()

    // ✅ Sync Shiprocket
    try {
      const shiprocketPayload = {
        order_id: String(order.orderId),
    order_date: new Date().toISOString(),
    pickup_location: "warehouse",
    billing_customer_name: String(order.address.fullName),
    billing_last_name: "",
    billing_address: String(order.address.street),
    billing_city: String(order.address.city),
    billing_pincode: String(order.address.postcode),
    billing_state: String(order.address.state),
    billing_country: String(order.address.country),
    billing_email: String(order.address.email),
    billing_phone: String(order.address.phone),
    order_items: order.items.map((i) => ({
      name: String(i.productName),
      sku: typeof i.productId === "object" && i.productId !== null && i.productId._id
        ? String(i.productId._id)
        : String(i.productId),
      units: Number(i.quantity),
      selling_price: Number(i.price),
    })),
    payment_method: "Prepaid",
    sub_total: Number(order.totalAmount),
    length: 10,
        breadth: 10,
        height: 10,
        weight: 1.0,
      }

      const shipRes = await shiprocketService.createOrder(shiprocketPayload)
      if (shipRes?.order_id) {
        order.shiprocketOrderId = shipRes.order_id
        order.shiprocketShipmentId = shipRes.shipment_id
        order.trackingNumber = shipRes.awb_code
        await order.save()
      }
    } catch (shipErr) {
      console.error("Shiprocket sync error:", shipErr.message)
    }

    res.json({ success: true, message: "Payment verified & order confirmed", order })
  } catch (err) {
    console.error("Verify payment error:", err)
    res.status(500).json({ success: false, message: "Error verifying payment" })
  }
}

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    console.log("Getting orders for user:", userId)

    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    console.log("Found orders:", orders.length)

    const totalOrders = await Order.countDocuments({ userId })
    const totalPages = Math.ceil(totalOrders / limit)

    res.status(200).json({
      success: true,
      orders,
      count: totalOrders,
      pages_count: totalPages,
      current_page: page,
    })
  } catch (error) {
    console.error("Get user orders error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    })
  }
}

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params
    const userId = req.user._id

    console.log("Getting order by ID:", orderId, "for user:", userId)

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
      userId,
    }).populate("items.productId")

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Get order by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    })
  }
}

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params
    const { status, paymentStatus } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    if (status) order.status = status
    if (paymentStatus) order.paymentStatus = paymentStatus

    await order.save()

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    })
  }
}

// Get all orders for a specific user (admin function)
const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.userId
    console.log("Fetching orders for userId:", userId)

    const orders = await Order.find({ userId }).populate("items.productId")
    console.log("Found orders for user:", orders.length)

    res.json({ success: true, orders })
  } catch (error) {
    console.error("getOrdersByUser error:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId") // To get user info
      .populate("items.productId") // To get product info
      .sort({ createdAt: -1 })

    console.log("Total orders found:", orders.length)

    res.status(200).json({ success: true, orders })
  } catch (error) {
    console.error("Get all orders error:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Mark all orders for a user as seen by admin
const markOrdersAsSeen = async (req, res) => {
  try {
    const { userId } = req.params
    await Order.updateMany({ userId, seenByAdmin: false }, { $set: { seenByAdmin: true } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking orders as seen",
      error: error.message,
    })
  }
}

// Get unseen orders count for admin notifications
const getUnseenOrdersCount = async (req, res) => {
  try {
    const count = await Order.countDocuments({ seenByAdmin: false })
    res.json({ success: true, count })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting unseen orders count",
      error: error.message,
    })
  }
}

const downloadReceipt = async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await Order.findOne({ orderId }).populate("items.productId")

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=receipt_${orderId}.pdf`)

    // Create PDF
    const doc = new PDFDocument()
    doc.pipe(res)

    doc.fontSize(20).text("Order Receipt", { align: "center" })
    doc.moveDown()

    doc.fontSize(12).text(`Order ID: ${order.orderId}`)
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`)
    doc.text(`Customer: ${order.address.fullName}`)
    doc.text(`Email: ${order.address.email}`)
    doc.text(
      `Address: ${order.address.street}, ${order.address.city}, ${order.address.postcode}, ${order.address.country}`,
    )

    doc.moveDown()
    doc.text("Items:", { underline: true })
    order.items.forEach((item, idx) => {
      doc.text(`${idx + 1}. ${item.productName} x${item.quantity} - ₹${item.price}`)
    })

    doc.moveDown()
    doc.text(`Total: ₹${order.totalAmount}`, { bold: true })

    doc.end()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating receipt",
      error: error.message,
    })
  }
}

// Create Shiprocket order
const createShiprocketOrder = async (req, res) => {
  try {
    console.log("Creating Shiprocket order with data:", req.body)

    const orderData = req.body

    // Validate required fields
    if (!orderData.order_id || !orderData.billing_customer_name || !orderData.billing_phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for Shiprocket order",
      })
    }

    const result = await shiprocketService.createOrder(orderData)

    // Update the order with Shiprocket details if successful
    if (result && result.order_id) {
      try {
        await Order.findOneAndUpdate(
          { orderId: orderData.order_id },
          {
            shiprocketOrderId: result.order_id,
            shiprocketShipmentId: result.shipment_id,
            trackingNumber: result.awb_code,
          },
        )
        console.log("Order updated with Shiprocket details")
      } catch (updateError) {
        console.error("Error updating order with Shiprocket details:", updateError)
      }
    }

    res.json({ success: true, data: result })
  } catch (error) {
    console.error("Shiprocket order creation error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create Shiprocket order",
    })
  }
}

// ===============================
// REPLACEMENT REQUESTS (Top-level)
// ===============================

// Create a replacement request for an order
const createReplacementRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;
    const { productId, reason, note } = req.body;

    const existing = await ReplacementRequest.findOne({ orderId, productId, userId });
    if (existing) {
      return res.status(400).json({ success: false, message: "This product has already been replaced" });
    }

    const request = await ReplacementRequest.create({ orderId, productId, userId, reason, note });
    return res.status(201).json({ success: true, message: "Replacement request created", data: request });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create replacement request" });
  }
};


// List replacement requests (admin)
const getReplacementRequests = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [rows, count] = await Promise.all([
    ReplacementRequest.find({})
      .populate({ path: "orderId", select: "orderId totalAmount createdAt" })
      .populate({ path: "userId", select: "name email" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ReplacementRequest.countDocuments()
  ]);

  return res.json({ success: true, rows, count, pages_count: Math.ceil(count / limit), current_page: page });
};


// Update replacement request status (admin)
// PUT /api/admin/replacements/:id
// PUT /api/orders/replacements/:id/status
const updateReplacementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // pending, approved, rejected

    const replacement = await ReplacementRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    return res.json({ success: true, replacement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};



// Get replacement requests for the logged-in user
const getMyReplacementRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ReplacementRequest.find({ userId })
      .populate({ path: "orderId", select: "orderId totalAmount createdAt" })
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: requests });
  } catch (error) {
    console.error("getMyReplacementRequests error:", error);
    return res.status(500).json({ success: false, message: "Failed to get replacement requests" });
  }
};


module.exports = {
  placeOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByUser,
  getAllOrders,
  markOrdersAsSeen,
  getUnseenOrdersCount,
  downloadReceipt,
  createShiprocketOrder,

  createReplacementRequest,
  getReplacementRequests,
  updateReplacementStatus,
  getMyReplacementRequests,
}
