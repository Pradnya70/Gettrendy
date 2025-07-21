const SubCategory = require("../models/SubCategory")
const Category = require("../models/Category")
const mongoose = require("mongoose")
const cloudinary = require("../utils/cloudinary")

// Helper function to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  try {
    if (!url || typeof url !== "string") return null

    // Handle both HTTP and HTTPS URLs
    // Example URL: https://res.cloudinary.com/your-cloud/image/upload/v1234567890/getTrendy/subcategories/subcategory_1234567890_name.jpg
    const urlParts = url.split("/")
    const uploadIndex = urlParts.findIndex((part) => part === "upload")

    if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
      // Get everything after version (v1234567890)
      const pathAfterVersion = urlParts.slice(uploadIndex + 2).join("/")
      // Remove file extension
      const publicId = pathAfterVersion.replace(/\.[^/.]+$/, "")
      return publicId
    }

    return null
  } catch (error) {
    console.error("Error extracting public_id:", error)
    return null
  }
}

// Helper function to delete image from Cloudinary
const deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== "string") return

    // Extract public_id from Cloudinary URL
    const publicId = extractPublicIdFromUrl(imageUrl)

    if (publicId) {
      console.log("🗑️ Deleting image from Cloudinary:", publicId)
      const result = await cloudinary.cloudinary.uploader.destroy(publicId)
      console.log("✅ Image deleted:", result)
      return result
    }
  } catch (error) {
    console.error("❌ Error deleting image from Cloudinary:", error)
  }
}

// Get all subcategories
const getAllSubCategories = async (req, res) => {
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
const getSubCategoryById = async (req, res) => {
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
const createSubCategory = async (req, res) => {
  try {
    console.log("\n🆕 Creating new subcategory...")
    console.log("📝 Request body:", req.body)
    console.log("📁 File received:", req.file)

    const { subcategory_name, subcategory_description, parent_category } = req.body

    // Validation
    if (!subcategory_name || subcategory_name.trim() === "") {
      console.log("❌ Validation failed: subcategory_name is required")

      // Clean up uploaded image if validation fails
      if (req.file && req.file.path) {
        await deleteCloudinaryImage(req.file.path)
      }

      return res.status(400).json({
        success: false,
        message: "Subcategory name is required",
      })
    }

    if (!parent_category || parent_category.trim() === "") {
      console.log("❌ Validation failed: parent_category is required")

      // Clean up uploaded image if validation fails
      if (req.file && req.file.path) {
        await deleteCloudinaryImage(req.file.path)
      }

      return res.status(400).json({
        success: false,
        message: "Parent category is required",
      })
    }

    // Validate parent category exists
    if (!mongoose.Types.ObjectId.isValid(parent_category)) {
      console.log("❌ Validation failed: Invalid parent_category ID")

      // Clean up uploaded image if validation fails
      if (req.file && req.file.path) {
        await deleteCloudinaryImage(req.file.path)
      }

      return res.status(400).json({
        success: false,
        message: "Invalid parent category ID",
      })
    }

    console.log("🔍 Checking if parent category exists...")
    const parentCategoryExists = await Category.findById(parent_category)
    if (!parentCategoryExists) {
      console.log("❌ Parent category not found in database")

      // Clean up uploaded image if validation fails
      if (req.file && req.file.path) {
        await deleteCloudinaryImage(req.file.path)
      }

      return res.status(400).json({
        success: false,
        message: "Parent category not found",
      })
    }

    console.log("✅ Parent category found:", parentCategoryExists.category_name)

    // Check if subcategory already exists in this parent category
    const existingSubCategory = await SubCategory.findOne({
      subcategory_name: { $regex: new RegExp(`^${subcategory_name.trim()}$`, "i") },
      parent_category,
    })

    if (existingSubCategory) {
      console.log("❌ Subcategory already exists in this category")

      // Clean up uploaded image if validation fails
      if (req.file && req.file.path) {
        await deleteCloudinaryImage(req.file.path)
      }

      return res.status(400).json({
        success: false,
        message: "Subcategory with this name already exists in this category",
      })
    }

    // Process uploaded image from Cloudinary
    let subcategory_logo = null
    if (req.file && req.file.path) {
      subcategory_logo = req.file.path // Cloudinary URL
      console.log("✅ File processed successfully from Cloudinary:", subcategory_logo)
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

    // Clean up uploaded image if creation fails
    if (req.file && req.file.path) {
      await deleteCloudinaryImage(req.file.path)
    }

    res.status(500).json({
      success: false,
      message: "Error creating subcategory",
      error: error.message,
    })
  }
}

// Update subcategory (admin only)
const updateSubCategory = async (req, res) => {
  try {
    console.log("\n✏️ Updating subcategory...")
    const { id } = req.params
    const { subcategory_name, subcategory_description, parent_category } = req.body

    console.log("📝 Update data:", { id, subcategory_name, subcategory_description, parent_category })
    console.log("📁 New file received:", req.file)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Clean up uploaded image if validation fails
      if (req.file && req.file.path) {
        await deleteCloudinaryImage(req.file.path)
      }

      return res.status(400).json({
        success: false,
        message: "Invalid subcategory ID",
      })
    }

    // Find the existing subcategory
    const existingSubCategory = await SubCategory.findById(id)
    if (!existingSubCategory) {
      // Clean up uploaded image if subcategory not found
      if (req.file && req.file.path) {
        await deleteCloudinaryImage(req.file.path)
      }

      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      })
    }

    console.log("📋 Existing subcategory found:", existingSubCategory.subcategory_name)
    console.log("🖼️ Existing image:", existingSubCategory.subcategory_logo)

    // Validate required fields
    if (!subcategory_name || subcategory_name.trim() === "") {
      // Clean up uploaded image if validation fails
      if (req.file && req.file.path) {
        await deleteCloudinaryImage(req.file.path)
      }

      return res.status(400).json({
        success: false,
        message: "Subcategory name is required",
      })
    }

    if (!parent_category || parent_category.trim() === "") {
      // Clean up uploaded image if validation fails
      if (req.file && req.file.path) {
        await deleteCloudinaryImage(req.file.path)
      }

      return res.status(400).json({
        success: false,
        message: "Parent category is required",
      })
    }

    // Validate parent category if provided
    if (parent_category && !mongoose.Types.ObjectId.isValid(parent_category)) {
      // Clean up uploaded image if validation fails
      if (req.file && req.file.path) {
        await deleteCloudinaryImage(req.file.path)
      }

      return res.status(400).json({
        success: false,
        message: "Invalid parent category ID",
      })
    }

    if (parent_category) {
      const parentCategoryExists = await Category.findById(parent_category)
      if (!parentCategoryExists) {
        // Clean up uploaded image if validation fails
        if (req.file && req.file.path) {
          await deleteCloudinaryImage(req.file.path)
        }

        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        })
      }
    }

    // Check if another subcategory with the same name exists in the same category
    if (subcategory_name && subcategory_name.trim() !== existingSubCategory.subcategory_name) {
      const duplicateSubCategory = await SubCategory.findOne({
        subcategory_name: { $regex: new RegExp(`^${subcategory_name.trim()}$`, "i") },
        parent_category: parent_category || existingSubCategory.parent_category,
        _id: { $ne: id },
      })

      if (duplicateSubCategory) {
        // Clean up uploaded image if validation fails
        if (req.file && req.file.path) {
          await deleteCloudinaryImage(req.file.path)
        }

        return res.status(400).json({
          success: false,
          message: "Subcategory with this name already exists in this category",
        })
      }
    }

    // Handle image update
    let subcategory_logo = existingSubCategory.subcategory_logo

    if (req.file && req.file.path) {
      console.log("🔄 New image uploaded, processing...")

      // Delete old image from Cloudinary if it exists
      if (existingSubCategory.subcategory_logo) {
        console.log("🗑️ Deleting old image from Cloudinary:", existingSubCategory.subcategory_logo)
        await deleteCloudinaryImage(existingSubCategory.subcategory_logo)
      }

      // Set new image URL from Cloudinary
      subcategory_logo = req.file.path
      console.log("✅ New image URL set:", subcategory_logo)
    } else {
      console.log("⚠️ No new image uploaded, keeping existing image")
    }

    // Prepare update data
    const updateData = {
      subcategory_name: subcategory_name ? subcategory_name.trim() : existingSubCategory.subcategory_name,
      subcategory_description:
        subcategory_description !== undefined
          ? subcategory_description
            ? subcategory_description.trim()
            : ""
          : existingSubCategory.subcategory_description,
      parent_category: parent_category || existingSubCategory.parent_category,
      subcategory_logo,
    }

    console.log("💾 Final update data:", updateData)

    // Update the subcategory
    const subcategory = await SubCategory.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("parent_category", "category_name")

    console.log("✅ Subcategory updated successfully")
    console.log("🖼️ Final image URL:", subcategory.subcategory_logo)

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: subcategory,
    })
  } catch (error) {
    console.error("❌ Update subcategory error:", error)

    // Clean up uploaded image if update fails
    if (req.file && req.file.path) {
      await deleteCloudinaryImage(req.file.path)
    }

    res.status(500).json({
      success: false,
      message: "Error updating subcategory",
      error: error.message,
    })
  }
}

// Delete subcategory (admin only)
const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params
    console.log("🗑️ Deleting subcategory:", id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subcategory ID",
      })
    }

    const subcategory = await SubCategory.findById(id)
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      })
    }

    // Delete subcategory image from Cloudinary if exists
    if (subcategory.subcategory_logo) {
      await deleteCloudinaryImage(subcategory.subcategory_logo)
    }

    // Delete subcategory from database
    await SubCategory.findByIdAndDelete(id)

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

module.exports = {
  getAllSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
}
