const { getAllOrders, trackOrder } = require("../services/shiprocketService");
const Order = require("../models/Order");

// ✅ Fetch all Shiprocket orders
exports.fetchShiprocketOrders = async (req, res) => {
  try {
    const { page = 1, per_page = 10 } = req.query;
    const orders = await getAllOrders(page, per_page);
    res.json(orders);
  } catch (err) {
    console.error("Error fetching Shiprocket orders:", err.message);
    res.status(500).json({ message: "Error fetching Shiprocket orders", error: err.message });
  }
};

// ✅ Fetch tracking info for a specific order
exports.fetchTracking = async (req, res) => {
  try {
    const { awb } = req.params; // AWB = Air Waybill number from Shiprocket
    const tracking = await trackOrder(awb);
    res.json(tracking);
  } catch (err) {
    console.error("Error tracking Shiprocket order:", err.message);
    res.status(500).json({ message: "Error tracking order", error: err.message });
  }
};
