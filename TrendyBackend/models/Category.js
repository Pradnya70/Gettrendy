const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
  {
    category_name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    category_description: {
      type: String,
      trim: true,
    },
    category_image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Category", categorySchema)
