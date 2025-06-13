const SubCategory = require("../models/SubCategory")
const Category = require("../models/Category")
const Product = require("../models/Product")
const fs = require("fs")
const path = require("path")
const multer = require("multer")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/subcategories"
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"))
  },
})

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|Avif)$/)) {
    return cb(new Error("Only image files are allowed!"), false)
  }
  cb(null, true)
}

exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

// Get all subcategories with pagination and filtering
exports.getAllSubCategories = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object based on query parameters
    const filter = {}

    // Filter by parent category if provided
    if (req.query.category) {
      filter.parent_category = req.query.category
    }

    // Get total count for pagination
    const count = await SubCategory.countDocuments(filter)

    // Get subcategories with pagination and populate parent category
    const subcategories = await SubCategory.find(filter)
      .populate("parent_category", "category_name")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)

    // Calculate total pages
    const pages_count = Math.ceil(count / limit)

    res.status(200).json({
      success: true,
      count,
      pages_count,
      page,
      limit,
      rows: subcategories,
    })
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get a single subcategory by ID
exports.getSubCategoryById = async (req, res) => {
  try {
    const subcategory = await SubCategory.findById(req.params.id).populate("parent_category", "category_name")

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      })
    }

    res.status(200).json({
      success: true,
      data: subcategory,
    })
  } catch (error) {
    console.error("Error fetching subcategory:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Create a new subcategory
exports.createSubCategory = async (req, res) => {
  try {
    const { subcategory_name,  subcategory_description, parent_category } = req.body

    // Check if parent category exists
    const categoryExists = await Category.findById(parent_category)
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Parent category not found",
      })
    }

    // Check if subcategory already exists under this parent
    const existingSubCategory = await SubCategory.findOne({
      subcategory_name,
      parent_category,
    })

    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        message: "Subcategory with this name already exists under the selected category",
      })
    }

    // Process uploaded image
    let subcategory_image = null
    if (req.file) {
      subcategory_image = `/uploads/subcategories/${req.file.filename}`
    }

    // Create new subcategory
    const subcategory = new SubCategory({
      subcategory_name,
      subcategory_description,
      subcategory_image,
      parent_category,
    })

    await subcategory.save()

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: subcategory,
    })
  } catch (error) {
    console.error("Error creating subcategory:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update a subcategory
exports.updateSubCategory = async (req, res) => {
  try {
    const subcategoryId = req.params.id

    // Check if subcategory exists
    const subcategory = await SubCategory.findById(subcategoryId)
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      })
    }

    const { subcategory_name, subcategory_description, parent_category } = req.body

    // Check if parent category exists if provided
    if (parent_category) {
      const categoryExists = await Category.findById(parent_category)
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        })
      }
    }

    // Check if new subcategory name already exists under the parent (if name or parent is being changed)
    if (
      (subcategory_name && subcategory_name !== subcategory.subcategory_name) ||
      (parent_category && parent_category !== subcategory.parent_category.toString())
    ) {
      const existingSubCategory = await SubCategory.findOne({
        subcategory_name: subcategory_name || subcategory.subcategory_name,
        parent_category: parent_category || subcategory.parent_category,
      })

      if (existingSubCategory && existingSubCategory._id.toString() !== subcategoryId) {
        return res.status(400).json({
          success: false,
          message: "Subcategory with this name already exists under the selected category",
        })
      }
    }

    // Process uploaded image
    let subcategory_image = subcategory.subcategory_image
    if (req.file) {
      // Delete old image if exists
      if (subcategory.subcategory_image) {
        const oldImagePath = path.join(__dirname, "..", subcategory.subcategory_image)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }

      subcategory_image = `/uploads/subcategories/${req.file.filename}`
    }

    // Update subcategory
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      subcategoryId,
      {
        subcategory_name: subcategory_name || subcategory.subcategory_name,
        subcategory_description: subcategory_description || subcategory.subcategory_description,
        subcategory_image,
        parent_category: parent_category || subcategory.parent_category,
        updated_at: Date.now(),
      },
      { new: true, runValidators: true },
    )

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: updatedSubCategory,
    })
  } catch (error) {
    console.error("Error updating subcategory:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Delete a subcategory
exports.deleteSubCategory = async (req, res) => {
  try {
    const subcategoryId = req.params.id

    // Check if subcategory exists
    const subcategory = await SubCategory.findById(subcategoryId)
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      })
    }

    // Check if subcategory has associated products
    const productsCount = await Product.countDocuments({ subcategory: subcategoryId })
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete subcategory with associated products. Please delete or reassign products first.",
      })
    }

    // Delete subcategory image from server
    if (subcategory.subcategory_image) {
      const imagePath = path.join(__dirname, "..", subcategory.subcategory_image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    // Delete subcategory from database
    await SubCategory.findByIdAndDelete(subcategoryId)

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting subcategory:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
