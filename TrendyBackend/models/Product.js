const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    product_description: {
      type: String,
      trim: true, // Made optional as requested
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    discount_price: {
      type: Number,
      min: 0,
      default: function () {
        return this.price
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      default: null,
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: 0,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    Bestseller: {
      type: Boolean,
      default: false,
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => {
          return v.length <= 3 // Maximum 3 images
        },
        message: "Maximum 3 images allowed",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Update the updatedAt field on save
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("Product", productSchema)
