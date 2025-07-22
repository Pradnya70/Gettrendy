const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const shiprocketService = require("../services/shiprocketService");

// Place a new order
const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, totalAmount, paymentMethod, address, notes } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid total amount is required",
      });
    }

    if (
      !address ||
      !address.fullName ||
      !address.street ||
      !address.city ||
      !address.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete address information is required",
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate products exist
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID: ${item.productId}`,
        });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productName || item.productId}`,
        });
      }
    }

    // Generate order ID
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

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
    });

    await order.save();

    // Clear user's cart after successful order
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
      orderId: order.orderId,
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({
      success: false,
      message: "Error placing order",
      error: error.message,
    });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ userId });
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      orders,
      count: totalOrders,
      pages_count: totalPages,
      current_page: page,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
      userId,
    }).populate("items.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

// Get all orders for a specific user
const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching orders for userId:", userId);
    // Adjust the field name if your schema uses a different one (e.g., user, user_id, etc.)
    const orders = await Order.find({ userId }).populate("items.productId");
    res.json({ success: true, orders });
  } catch (error) {
    console.error("getOrdersByUser error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId") // To get user info
      .populate("items.productId") // To get product info
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all orders for a user as seen by admin
const markOrdersAsSeen = async (req, res) => {
  try {
    const { userId } = req.params;
    await Order.updateMany(
      { userId, seenByAdmin: false },
      { $set: { seenByAdmin: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking orders as seen",
      error: error.message,
    });
  }
};

const downloadReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId }).populate("items.productId");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${orderId}.pdf`
    );

    // Create PDF
    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(20).text("Order Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order.orderId}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Customer: ${order.address.fullName}`);
    doc.text(`Email: ${order.address.email}`);
    doc.text(
      `Address: ${order.address.street}, ${order.address.city}, ${order.address.postcode}, ${order.address.country}`
    );
    doc.moveDown();

    doc.text("Items:", { underline: true });
    order.items.forEach((item, idx) => {
      doc.text(
        `${idx + 1}. ${item.productName} x${item.quantity} - ₹${item.price}`
      );
    });
    doc.moveDown();
    doc.text(`Total: ₹${order.totalAmount}`, { bold: true });

    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating receipt",
      error: error.message,
    });
  }
};

// Define the function
const createShiprocketOrder = async (req, res) => {
  try {
    const orderData = req.body; // Validate this in production!
    const result = await shiprocketService.createOrder(orderData);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByUser, // <-- This is correct!
  getAllOrders,
  markOrdersAsSeen,
  downloadReceipt,
  createShiprocketOrder,
};
