const Order = require("../models/Order")
const Cart = require("../models/Cart")
const User = require("../models/User")
const Product = require("../models/Product")
const mongoose = require("mongoose")

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

    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

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

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
}
