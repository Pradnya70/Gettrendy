const Category = require("../models/Category")
const mongoose = require("mongoose")
const cloudinary = require("../utils/cloudinary")
const { categoryUpload } = require("../middleware/multer")

// Helper function to delete image from Cloudinary
const deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== "string") return

    // Extract public_id from Cloudinary URL
    const publicId = extractPublicIdFromUrl(imageUrl)
    if (publicId) {
      console.log("🗑️ Deleting image from Cloudinary:", publicId)
      const result = await cloudinary.uploader.destroy(publicId)
      console.log("✅ Image deleted:", result)
      return result
    }
  } catch (error) {
    console.error("❌ Error deleting image from Cloudinary:", error)
  }
}

// Helper function to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  try {
    if (!url || typeof url !== "string") return null

    const urlParts = url.split("/")
    const uploadIndex = urlParts.findIndex((part) => part === "upload")

    if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
      const pathAfterVersion = urlParts.slice(uploadIndex + 2).join("/")
      const publicId = pathAfterVersion.replace(/\.[^/.]+$/, "")
      return publicId
    }

    return null
  } catch (error) {
    console.error("Error extracting public_id:", error)
    return null
  }
}

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    console.log("📋 Getting all categories...")
    const { page = 1, limit = 50 } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.max(1, Math.min(100, Number(limit)))
    const skip = (pageNum - 1) * limitNum

    const categories = await Category.find({}).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean()

    const totalCount = await Category.countDocuments()
    const totalPages = Math.ceil(totalCount / limitNum)

    console.log(`✅ Found ${categories.length} categories`)

    res.status(200).json({
      success: true,
      data: categories,
      rows: categories,
      count: totalCount,
      pages_count: totalPages,
      current_page: pageNum,
    })
  } catch (error) {
    console.error("❌ Get all categories error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    })
  }
}

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params
    console.log("🔍 Getting category by ID:", id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      })
    }

    const category = await Category.findById(id).lean()

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    console.log("✅ Category found:", category.category_name)

    res.status(200).json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error("❌ Get category by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching category",
      error: error.message,
    })
  }
}

// Create new category (admin only)
const createCategory = async (req, res) => {
  try {
    console.log("\n🆕 Creating new category...")
    console.log("📝 Request body:", req.body)
    console.log("📁 File received:", req.file)

    const { category_name, category_description } = req.body

    // Validation
    if (!category_name || category_name.trim() === "") {
      console.log("❌ Validation failed: category_name is required")
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      })
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      category_name: { $regex: new RegExp(`^${category_name.trim()}$`, "i") },
    })

    if (existingCategory) {
      console.log("❌ Category already exists:", category_name)
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      })
    }

    // Process uploaded image from Cloudinary
    let category_image = null
    if (req.file) {
      category_image = req.file.path // Cloudinary URL
      console.log("✅ File processed successfully from Cloudinary:", category_image)
    } else {
      console.log("⚠️ No file uploaded")
    }

    const categoryData = {
      category_name: category_name.trim(),
      category_description: category_description ? category_description.trim() : "",
      category_image,
    }

    console.log("💾 Saving category data:", categoryData)

    const category = new Category(categoryData)
    await category.save()

    console.log("✅ Category created successfully:", category._id)

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    })
  } catch (error) {
    console.error("❌ Create category error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    })
  }
}

// Update category (admin only)
const updateCategory = async (req, res) => {
  try {
    console.log("\n✏️ Updating category...")
    const { id } = req.params
    const { category_name, category_description } = req.body

    console.log("📝 Update data:", { id, category_name, category_description })
    console.log("📁 New file received:", req.file)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      })
    }

    // Find the existing category
    const existingCategory = await Category.findById(id)
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    console.log("📋 Existing category found:", existingCategory.category_name)
    console.log("🖼️ Existing image:", existingCategory.category_image)

    // Check if new category name already exists (excluding current category)
    if (category_name && category_name.trim() !== existingCategory.category_name) {
      const duplicateCategory = await Category.findOne({
        category_name: { $regex: new RegExp(`^${category_name.trim()}$`, "i") },
        _id: { $ne: id },
      })

      if (duplicateCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        })
      }
    }

    // Handle image update
    let category_image = existingCategory.category_image

    if (req.file) {
      console.log("🔄 New image uploaded, processing...")

      // Delete old image from Cloudinary if it exists
      if (existingCategory.category_image) {
        console.log("🗑️ Deleting old image from Cloudinary:", existingCategory.category_image)
        await deleteCloudinaryImage(existingCategory.category_image)
      }

      // Set new image URL from Cloudinary
      category_image = req.file.path
      console.log("✅ New image URL set:", category_image)
    } else {
      console.log("⚠️ No new image uploaded, keeping existing image")
    }

    // Prepare update data
    const updateData = {
      category_name: category_name || existingCategory.category_name,
      category_description:
        category_description !== undefined ? category_description : existingCategory.category_description,
      category_image,
    }

    console.log("💾 Final update data:", updateData)

    // Update the category
    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    console.log("✅ Category updated successfully")
    console.log("🖼️ Final image URL:", category.category_image)

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    })
  } catch (error) {
    console.error("❌ Update category error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    })
  }
}

// Delete category (admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params
    console.log("🗑️ Deleting category:", id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      })
    }

    const category = await Category.findByIdAndDelete(id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    // Delete category image from Cloudinary if exists
    if (category.category_image) {
      await deleteCloudinaryImage(category.category_image)
    }

    console.log("✅ Category deleted successfully")

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("❌ Delete category error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    })
  }
}

module.exports = {
  upload: categoryUpload,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
}
