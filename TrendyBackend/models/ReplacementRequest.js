const mongoose = require("mongoose");

const replacementRequestSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
  type: { type: String, enum: ["replacement"], default: "replacement" },
  reason: { type: String, required: true, trim: true },
  note: { type: String, trim: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

// Enforce one replacement per product per order per user
replacementRequestSchema.index({ orderId: 1, productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("ReplacementRequest", replacementRequestSchema);
