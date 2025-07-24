const Order = require("../models/Order")
const Cart = require("../models/Cart")
const User = require("../models/User")
const Product = require("../models/Product")
const mongoose = require("mongoose")
const PDFDocument = require("pdfkit")
const shiprocketService = require("../services/shiprocketService")
const { sendOrderConfirmationToUser, sendNewOrderNotificationToAdmin } = require("../services/emailService")

// Place a new order
const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id
    const { items, totalAmount, paymentMethod, address, notes } = req.body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      })
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid total amount is required",
      })
    }

    if (!address || !address.fullName || !address.street || !address.city || !address.phone) {
      return res.status(400).json({
        success: false,
        message: "Complete address information is required",
      })
    }

    // Get user info
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Validate products exist
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID: ${item.productId}`,
        })
      }

      const product = await Product.findById(item.productId)
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productName || item.productId}`,
        })
      }
    }

    // Generate order ID
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`

    // Create order
    const order = new Order({
      orderId,
      userId,
      userName: user.name,
      userEmail: user.email,
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        size: item.size || "M",
        color: item.color || "Default",
      })),
      totalAmount,
      paymentMethod: paymentMethod || "CASH",
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
      status: "pending",
      paymentStatus: paymentMethod === "CASH" ? "pending" : "paid",
    })

    await order.save()

    // Send emails
    try {
      // Use address email if provided, otherwise use user's registered email
      const emailToSend = address.email || user.email
      console.log("Sending confirmation email to:", emailToSend)

      // Send confirmation email to user
      const userEmailResult = await sendOrderConfirmationToUser(emailToSend, order)
      if (userEmailResult.success) {
        order.userEmailSent = true
        order.userNotified = true
        console.log("User email sent successfully")
      } else {
        console.error("Failed to send user email:", userEmailResult.error)
      }

      // Send notification email to admin
      const adminEmailResult = await sendNewOrderNotificationToAdmin(order)
      if (adminEmailResult.success) {
        order.adminEmailSent = true
        order.adminNotified = true
        console.log("Admin email sent successfully")
      } else {
        console.error("Failed to send admin email:", adminEmailResult.error)
      }

      await order.save()
    } catch (emailError) {
      console.error("Error sending emails:", emailError)
      // Don't fail the order if email sending fails
    }

    // Clear user's cart after successful order
    await Cart.findOneAndDelete({ userId })

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
      orderId: order.orderId,
    })
  } catch (error) {
    console.error("Place order error:", error)
    res.status(500).json({
      success: false,
      message: "Error placing order",
      error: error.message,
    })
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

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByUser,
  getAllOrders,
  markOrdersAsSeen,
  getUnseenOrdersCount,
  downloadReceipt,
  createShiprocketOrder,
}
