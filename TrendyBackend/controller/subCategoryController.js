const SubCategory = require("../models/SubCategory")
const Category = require("../models/Category")
const mongoose = require("mongoose")
const multer = require("multer")
const fs = require("fs")
const path = require("path")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/subcategories"
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

// Get all subcategories
exports.getAllSubCategories = async (req, res) => {
  try {
    console.log("📋 Getting all subcategories...")

    const { page = 1, limit = 50, parent_category } = req.query

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.max(1, Math.min(100, Number(limit)))
    const skip = (pageNum - 1) * limitNum

    // Build query
    const query = {}
    if (parent_category && mongoose.Types.ObjectId.isValid(parent_category)) {
      query.parent_category = parent_category
    }

    const subcategories = await SubCategory.find(query)
      .populate("parent_category", "category_name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()

    const totalCount = await SubCategory.countDocuments(query)
    const totalPages = Math.ceil(totalCount / limitNum)

    console.log(`✅ Found ${subcategories.length} subcategories`)

    res.status(200).json({
      success: true,
      data: subcategories,
      rows: subcategories,
      count: totalCount,
      pages_count: totalPages,
      current_page: pageNum,
    })
  } catch (error) {
    console.error("❌ Get all subcategories error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching subcategories",
      error: error.message,
    })
  }
}

// Get subcategory by ID
exports.getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params
    console.log("🔍 Getting subcategory by ID:", id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subcategory ID",
      })
    }

    const subcategory = await SubCategory.findById(id).populate("parent_category", "category_name").lean()

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      })
    }

    console.log("✅ Subcategory found:", subcategory.subcategory_name)

    res.status(200).json({
      success: true,
      data: subcategory,
    })
  } catch (error) {
    console.error("❌ Get subcategory by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching subcategory",
      error: error.message,
    })
  }
}

// Create new subcategory (admin only)
exports.createSubCategory = async (req, res) => {
  try {
    console.log("\n🆕 Creating new subcategory...")
    console.log("📝 Request body:", req.body)
    console.log("📁 File received:", req.file)

    const { subcategory_name, subcategory_description, parent_category } = req.body

    // Validation
    if (!subcategory_name || subcategory_name.trim() === "") {
      console.log("❌ Validation failed: subcategory_name is required")
      return res.status(400).json({
        success: false,
        message: "Subcategory name is required",
      })
    }

    if (!parent_category || parent_category.trim() === "") {
      console.log("❌ Validation failed: parent_category is required")
      return res.status(400).json({
        success: false,
        message: "Parent category is required",
      })
    }

    // Validate parent category exists
    if (!mongoose.Types.ObjectId.isValid(parent_category)) {
      console.log("❌ Validation failed: Invalid parent_category ID")
      return res.status(400).json({
        success: false,
        message: "Invalid parent category ID",
      })
    }

    console.log("🔍 Checking if parent category exists...")
    const parentCategoryExists = await Category.findById(parent_category)
    if (!parentCategoryExists) {
      console.log("❌ Parent category not found in database")
      return res.status(400).json({
        success: false,
        message: "Parent category not found",
      })
    }
    console.log("✅ Parent category found:", parentCategoryExists.category_name)

    // Process uploaded image
    let subcategory_logo = null
    if (req.file) {
      subcategory_logo = `/uploads/subcategories/${req.file.filename}`
      console.log("✅ File processed successfully:", subcategory_logo)
    } else {
      console.log("⚠️ No file uploaded")
    }

    const subcategoryData = {
      subcategory_name: subcategory_name.trim(),
      subcategory_description: subcategory_description ? subcategory_description.trim() : "",
      parent_category,
      subcategory_logo,
    }

    console.log("💾 Saving subcategory data:", subcategoryData)

    const subcategory = new SubCategory(subcategoryData)
    await subcategory.save()

    // Populate parent category for response
    await subcategory.populate("parent_category", "category_name")

    console.log("✅ Subcategory created successfully:", subcategory._id)

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: subcategory,
    })
  } catch (error) {
    console.error("❌ Create subcategory error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating subcategory",
      error: error.message,
    })
  }
}

// Update subcategory (admin only)
exports.updateSubCategory = async (req, res) => {
  try {
    console.log("\n✏️ Updating subcategory...")
    const { id } = req.params
    const { subcategory_name, subcategory_description, parent_category } = req.body

    console.log("📝 Update data:", { id, subcategory_name, subcategory_description, parent_category })
    console.log("📁 New file received:", req.file)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subcategory ID",
      })
    }

    // Find the existing subcategory
    const existingSubCategory = await SubCategory.findById(id)
    if (!existingSubCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      })
    }

    console.log("📋 Existing subcategory found:", existingSubCategory.subcategory_name)
    console.log("🖼️ Existing image:", existingSubCategory.subcategory_logo)

    // Validate parent category if provided
    if (parent_category && !mongoose.Types.ObjectId.isValid(parent_category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent category ID",
      })
    }

    if (parent_category) {
      const parentCategoryExists = await Category.findById(parent_category)
      if (!parentCategoryExists) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        })
      }
    }

    // Handle image update
    let subcategory_logo = existingSubCategory.subcategory_logo

    if (req.file) {
      console.log("🔄 New image uploaded, processing...")

      // Delete old image if it exists
      if (existingSubCategory.subcategory_logo) {
        console.log("🗑️ Deleting old image:", existingSubCategory.subcategory_logo)
        deleteOldImage(existingSubCategory.subcategory_logo)
      }

      // Set new image path
      subcategory_logo = `/uploads/subcategories/${req.file.filename}`
      console.log("✅ New image path set:", subcategory_logo)
    } else {
      console.log("⚠️ No new image uploaded, keeping existing image")
    }

    // Prepare update data
    const updateData = {
      subcategory_name: subcategory_name || existingSubCategory.subcategory_name,
      subcategory_description:
        subcategory_description !== undefined ? subcategory_description : existingSubCategory.subcategory_description,
      parent_category: parent_category || existingSubCategory.parent_category,
      subcategory_logo, // This will be either the new image path or the existing one
    }

    console.log("💾 Final update data:", updateData)

    // Update the subcategory
    const subcategory = await SubCategory.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("parent_category", "category_name")

    console.log("✅ Subcategory updated successfully")
    console.log("🖼️ Final image path:", subcategory.subcategory_logo)

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: subcategory,
    })
  } catch (error) {
    console.error("❌ Update subcategory error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating subcategory",
      error: error.message,
    })
  }
}

// Delete subcategory (admin only)
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params
    console.log("🗑️ Deleting subcategory:", id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subcategory ID",
      })
    }

    const subcategory = await SubCategory.findByIdAndDelete(id)

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      })
    }

    // Delete subcategory image if exists
    if (subcategory.subcategory_logo) {
      deleteOldImage(subcategory.subcategory_logo)
    }

    console.log("✅ Subcategory deleted successfully")

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    })
  } catch (error) {
    console.error("❌ Delete subcategory error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting subcategory",
      error: error.message,
    })
  }
}
