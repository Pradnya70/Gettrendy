const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
    },
    userEmail: {
      type: String,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        size: {
          type: String,
          default: "M",
        },
        color: {
          type: String,
          default: "Default",
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["CASH", "UPI", "RAZORPAY"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    address: {
      fullName: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      apartment: {
        type: String,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
      },
      postcode: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        default: "India",
      },
    },
    notes: {
      type: String,
    },
    // Razorpay specific fields
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    // Shiprocket specific fields
    shiprocketOrderId: {
      type: String,
    },
    shiprocketShipmentId: {
      type: String,
    },
    trackingNumber: {
      type: String,
    },
    // Notification fields
    seenByAdmin: {
      type: Boolean,
      default: false,
    },
    adminNotified: {
      type: Boolean,
      default: false,
    },
    userNotified: {
      type: Boolean,
      default: false,
    },
    // Email status
    userEmailSent: {
      type: Boolean,
      default: false,
    },
    adminEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Add indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 })
orderSchema.index({ orderId: 1 })
orderSchema.index({ razorpayOrderId: 1 })
orderSchema.index({ seenByAdmin: 1 })

module.exports = mongoose.model("Order", orderSchema)
