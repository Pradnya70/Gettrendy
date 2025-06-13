const mongoose = require("mongoose")

const subCategorySchema = new mongoose.Schema({
  subcategory_name: {
    type: String,
    required: true,
    trim: true,
  },
  subcategory_logo: {
    type: String,
    required: true,
    trim: true,
  },
  
  subcategory_description: {
    type: String,
    trim: true,
  },
  subcategory_image: {
    type: String,
  },
  parent_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("SubCategory", subCategorySchema)
