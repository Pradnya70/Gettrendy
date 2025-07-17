const Category = require("../models/Category")
const mongoose = require("mongoose")
const multer = require("multer")
const fs = require("fs")
const path = require("path")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/categories"
    console.log("📁 Creating upload directory:", uploadDir)

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
      console.log("✅ Upload directory created")
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + "-" + file.originalname.replace(/\s+/g, "-")
    console.log("📄 Generated filename:", filename)
    cb(null, filename)
  },
})

const fileFilter = (req, file, cb) => {
  console.log("🔍 File filter check:")
  console.log("  - Original name:", file.originalname)
  console.log("  - Mimetype:", file.mimetype)

  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
    console.log("❌ File rejected: Invalid file type")
    return cb(new Error("Only image files are allowed!"), false)
  }
  console.log("✅ File accepted")
  cb(null, true)
}

exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

// Helper function to delete old image file
const deleteOldImage = (imagePath) => {
  if (imagePath) {
    const fullPath = path.join(__dirname, "..", imagePath)
    console.log("🗑️ Attempting to delete old image:", fullPath)

    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath)
        console.log("✅ Old image deleted successfully")
      } catch (error) {
        console.error("❌ Error deleting old image:", error)
      }
    } else {
      console.log("⚠️ Old image file not found:", fullPath)
    }
  }
}

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    console.log("📋 Getting all categories...")

    const { page = 1, limit = 50 } = req.query

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.max(1, Math.min(100, Number(limit)))
    const skip = (pageNum - 1) * limitNum

    const categories = await Category.find({}).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean()

    const totalCount = await Category.countDocuments({})
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
exports.getCategoryById = async (req, res) => {
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
exports.createCategory = async (req, res) => {
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

    // Process uploaded image
    let category_image = null
    if (req.file) {
      category_image = `/uploads/categories/${req.file.filename}`
      console.log("✅ File processed successfully:", category_image)
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
exports.updateCategory = async (req, res) => {
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

    // Handle image update
    let category_image = existingCategory.category_image

    if (req.file) {
      console.log("🔄 New image uploaded, processing...")

      // Delete old image if it exists
      if (existingCategory.category_image) {
        console.log("🗑️ Deleting old image:", existingCategory.category_image)
        deleteOldImage(existingCategory.category_image)
      }

      // Set new image path
      category_image = `/uploads/categories/${req.file.filename}`
      console.log("✅ New image path set:", category_image)
    } else {
      console.log("⚠️ No new image uploaded, keeping existing image")
    }

    // Prepare update data
    const updateData = {
      category_name: category_name || existingCategory.category_name,
      category_description:
        category_description !== undefined ? category_description : existingCategory.category_description,
      category_image, // This will be either the new image path or the existing one
    }

    console.log("💾 Final update data:", updateData)

    // Update the category
    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    console.log("✅ Category updated successfully")
    console.log("🖼️ Final image path:", category.category_image)

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
exports.deleteCategory = async (req, res) => {
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

    // Delete category image if exists
    if (category.category_image) {
      deleteOldImage(category.category_image)
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
