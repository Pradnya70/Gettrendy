const Product = require("../models/Product")
const Category = require("../models/Category")
const SubCategory = require("../models/SubCategory")
const mongoose = require("mongoose")
const fs = require("fs")
const path = require("path")
const multer = require("multer")

// Configure multer for file uploads (max 3 images)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/products"
    console.log("📁 Creating upload directory:", uploadDir)

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

  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
    console.log("❌ File rejected: Invalid file type")
    return cb(new Error("Only image files are allowed!"), false)
  }
  console.log("✅ File accepted")
  cb(null, true)
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 3, // Maximum 3 files
  },
})

// Helper function to delete old image files
const deleteOldImages = (imagePaths) => {
  if (Array.isArray(imagePaths)) {
    imagePaths.forEach((imagePath) => {
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
    })
  }
}

// Helper function to convert string to boolean
const stringToBoolean = (value) => {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1"
  }
  return false
}

// Get all products with pagination and filtering
const getAllProducts = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const filter = {}

    // Build filter object
    if (req.query.category && req.query.category !== "null") {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        filter.category = new mongoose.Types.ObjectId(req.query.category)
      }
    }

    if (req.query.subcategory && req.query.subcategory !== "null") {
      if (mongoose.Types.ObjectId.isValid(req.query.subcategory)) {
        filter.subcategory = new mongoose.Types.ObjectId(req.query.subcategory)
      }
    }

    if (req.query.size) {
      filter.sizes = { $in: [req.query.size] }
    }

    if (req.query.color) {
      filter.colors = { $in: [req.query.color] }
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {}
      if (req.query.minPrice) filter.price.$gte = Number.parseFloat(req.query.minPrice)
      if (req.query.maxPrice) filter.price.$lte = Number.parseFloat(req.query.maxPrice)
    }

    if (req.query.search) {
      filter.product_name = { $regex: req.query.search, $options: "i" }
    }

    // Filter for featured products
    if (req.query.featured === "true") {
      filter.featured = true
    }

    // Filter for bestseller products
    if (req.query.bestseller === "true") {
      filter.bestseller = true
    }

    console.log("Product filter applied:", filter)

    const count = await Product.countDocuments(filter)

    let sortOptions = { createdAt: -1 }

    if (req.query.sortBy) {
      const sortBy = req.query.sortBy
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1

      if (sortBy === "name") {
        sortOptions = { product_name: sortOrder }
      } else if (sortBy === "price") {
        sortOptions = { price: sortOrder }
      } else if (sortBy === "createdAt") {
        sortOptions = { createdAt: sortOrder }
      }
    }

    const products = await Product.find(filter)
      .populate("category", "category_name")
      .populate("subcategory", "subcategory_name")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    const pages_count = Math.ceil(count / limit)

    console.log(`Found ${products.length} products matching filter`)

    res.status(200).json({
      success: true,
      count,
      pages_count,
      current_page: page,
      limit,
      data: products,
      rows: products,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      })
    }

    const product = await Product.findById(req.params.id)
      .populate("category", "category_name")
      .populate("subcategory", "subcategory_name")

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Create a new product
const createProduct = async (req, res) => {
  try {
    console.log("\n🆕 Creating new product...")
    console.log("📝 Request body:", req.body)
    console.log("📁 Files received:", req.files)

    const {
      product_name,
      product_description,
      price,
      discount_price,
      category,
      subcategory,
      sizes,
      colors,
      stock,
      featured,
      bestseller,
    } = req.body

    // Validate required fields
    if (!product_name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: product_name, price, category",
      })
    }

    // Validate category exists
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      })
    }

    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      })
    }

    // Validate subcategory if provided
    if (subcategory && subcategory !== "") {
      if (!mongoose.Types.ObjectId.isValid(subcategory)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subcategory ID",
        })
      }

      const subcategoryExists = await SubCategory.findById(subcategory)
      if (!subcategoryExists) {
        return res.status(400).json({
          success: false,
          message: "Subcategory not found",
        })
      }
    }

    // Process uploaded images (max 3)
    const images = []
    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({
          success: false,
          message: "Maximum 3 images allowed",
        })
      }

      req.files.forEach((file) => {
        images.push(`/uploads/products/${file.filename}`)
      })
      console.log("✅ Images processed:", images)
    }

    // Parse sizes and colors
    let parsedSizes = []
    if (sizes) {
      if (Array.isArray(sizes)) {
        parsedSizes = sizes.filter((size) => size && size.trim() !== "")
      } else if (typeof sizes === "string") {
        parsedSizes = sizes
          .split(",")
          .map((size) => size.trim())
          .filter((size) => size !== "")
      }
    }

    let parsedColors = []
    if (colors) {
      if (Array.isArray(colors)) {
        parsedColors = colors.filter((color) => color && color.trim() !== "")
      } else if (typeof colors === "string") {
        parsedColors = colors
          .split(",")
          .map((color) => color.trim())
          .filter((color) => color !== "")
      }
    }

    // Convert boolean values using helper function
    const isFeatured = stringToBoolean(featured)
    const isBestseller = stringToBoolean(bestseller)

    const product = new Product({
      product_name,
      product_description: product_description || "",
      price: Number.parseFloat(price),
      discount_price: discount_price ? Number.parseFloat(discount_price) : Number.parseFloat(price),
      category,
      subcategory: subcategory && subcategory !== "" ? subcategory : null,
      images,
      sizes: parsedSizes,
      colors: parsedColors,
      stock: Number.parseInt(stock) || 0,
      featured: isFeatured,
      bestseller: isBestseller,
    })

    await product.save()

    // Populate the response
    const populatedProduct = await Product.findById(product._id)
      .populate("category", "category_name")
      .populate("subcategory", "subcategory_name")

    console.log("✅ Product created successfully:", populatedProduct._id)

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: populatedProduct,
    })
  } catch (error) {
    console.error("Error creating product:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update a product
const updateProduct = async (req, res) => {
  try {
    console.log("\n✏️ Updating product...")
    const productId = req.params.id
    console.log("📝 Product ID:", productId)
    console.log("📝 Request body:", req.body)
    console.log("📁 New files received:", req.files)

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    console.log("📋 Existing product found:", product.product_name)
    console.log("🖼️ Existing images:", product.images)

    const {
      product_name,
      product_description,
      price,
      discount_price,
      category,
      subcategory,
      sizes,
      colors,
      stock,
      featured,
      bestseller,
      remove_images,
      replace_all_images, // New flag to indicate if we should replace all images
    } = req.body

    // Validate category if provided
    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      })
    }

    if (category) {
      const categoryExists = await Category.findById(category)
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Category not found",
        })
      }
    }

    // Validate subcategory if provided
    if (subcategory && subcategory !== "" && !mongoose.Types.ObjectId.isValid(subcategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subcategory ID",
      })
    }

    if (subcategory && subcategory !== "") {
      const subcategoryExists = await SubCategory.findById(subcategory)
      if (!subcategoryExists) {
        return res.status(400).json({
          success: false,
          message: "Subcategory not found",
        })
      }
    }

    // Handle image updates
    let updatedImages = [...product.images]

    // If replace_all_images is true, delete all existing images and use only new ones
    if (replace_all_images === "true" || replace_all_images === true) {
      console.log("🔄 Replacing all images...")

      // Delete all existing images
      if (product.images && product.images.length > 0) {
        console.log("🗑️ Deleting all existing images:", product.images)
        deleteOldImages(product.images)
      }

      // Start with empty array
      updatedImages = []

      // Add new images if provided
      if (req.files && req.files.length > 0) {
        if (req.files.length > 3) {
          return res.status(400).json({
            success: false,
            message: "Maximum 3 images allowed",
          })
        }

        req.files.forEach((file) => {
          updatedImages.push(`/uploads/products/${file.filename}`)
        })
        console.log("✅ New images added:", updatedImages)
      }
    } else {
      // Handle selective image removal and addition (existing logic)

      // Remove specified images
      if (remove_images) {
        const imagesToRemove = typeof remove_images === "string" ? [remove_images] : remove_images

        console.log("🗑️ Removing specific images:", imagesToRemove)

        // Filter out images to remove
        const imagesToKeep = updatedImages.filter((img) => !imagesToRemove.includes(img))

        // Delete files from filesystem
        const actualImagesToRemove = updatedImages.filter((img) => imagesToRemove.includes(img))
        deleteOldImages(actualImagesToRemove)

        updatedImages = imagesToKeep
        console.log("✅ Images after removal:", updatedImages)
      }

      // Add new images (ensure total doesn't exceed 3)
      if (req.files && req.files.length > 0) {
        const totalImages = updatedImages.length + req.files.length
        if (totalImages > 3) {
          return res.status(400).json({
            success: false,
            message: `Cannot add ${req.files.length} images. Maximum 3 images allowed. Current: ${updatedImages.length}`,
          })
        }

        req.files.forEach((file) => {
          updatedImages.push(`/uploads/products/${file.filename}`)
        })
        console.log("✅ Images after addition:", updatedImages)
      }
    }

    // Parse sizes and colors
    let parsedSizes = product.sizes
    if (sizes !== undefined) {
      if (Array.isArray(sizes)) {
        parsedSizes = sizes.filter((size) => size && size.trim() !== "")
      } else if (typeof sizes === "string") {
        parsedSizes = sizes
          .split(",")
          .map((size) => size.trim())
          .filter((size) => size !== "")
      } else {
        parsedSizes = []
      }
    }

    let parsedColors = product.colors
    if (colors !== undefined) {
      if (Array.isArray(colors)) {
        parsedColors = colors.filter((color) => color && color.trim() !== "")
      } else if (typeof colors === "string") {
        parsedColors = colors
          .split(",")
          .map((color) => color.trim())
          .filter((color) => color !== "")
      } else {
        parsedColors = []
      }
    }

    // Convert boolean values using helper function
    let isFeatured = product.featured
    if (featured !== undefined) {
      isFeatured = stringToBoolean(featured)
    }

    let isBestseller = product.bestseller
    if (bestseller !== undefined) {
      isBestseller = stringToBoolean(bestseller)
    }

    // Prepare update data
    const updateData = {
      product_name: product_name || product.product_name,
      product_description: product_description !== undefined ? product_description : product.product_description,
      price: price ? Number.parseFloat(price) : product.price,
      discount_price: discount_price ? Number.parseFloat(discount_price) : product.discount_price,
      category: category || product.category,
      subcategory: subcategory !== undefined ? (subcategory === "" ? null : subcategory) : product.subcategory,
      images: updatedImages,
      sizes: parsedSizes,
      colors: parsedColors,
      stock: stock !== undefined ? Number.parseInt(stock) : product.stock,
      featured: isFeatured,
      bestseller: isBestseller,
      updatedAt: Date.now(),
    }

    console.log("💾 Final update data:", updateData)

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true })
      .populate("category", "category_name")
      .populate("subcategory", "subcategory_name")

    console.log("✅ Product updated successfully")
    console.log("🖼️ Final images:", updatedProduct.images)

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    })
  } catch (error) {
    console.error("Error updating product:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id
    console.log("🗑️ Deleting product:", productId)

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Delete associated images
    if (product.images && product.images.length > 0) {
      deleteOldImages(product.images)
    }

    await Product.findByIdAndDelete(productId)

    console.log("✅ Product deleted successfully")

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get unique sizes and colors for filtering
const getProductFilters = async (req, res) => {
  try {
    const sizes = await Product.distinct("sizes")
    const colors = await Product.distinct("colors")

    res.status(200).json({
      success: true,
      data: {
        sizes: sizes.filter((size) => size && size.trim() !== ""),
        colors: colors.filter((color) => color && color.trim() !== ""),
      },
    })
  } catch (error) {
    console.error("Error fetching product filters:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const count = await Product.countDocuments({ featured: true })
    const products = await Product.find({ featured: true })
      .populate("category", "category_name")
      .populate("subcategory", "subcategory_name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const pages_count = Math.ceil(count / limit)

    console.log(`Found ${products.length} featured products`)

    res.status(200).json({
      success: true,
      count,
      pages_count,
      current_page: page,
      data: products,
      rows: products,
    })
  } catch (error) {
    console.error("Error fetching featured products:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get bestseller products
const getBestsellerProducts = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const count = await Product.countDocuments({ bestseller: true })
    const products = await Product.find({ bestseller: true })
      .populate("category", "category_name")
      .populate("subcategory", "subcategory_name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const pages_count = Math.ceil(count / limit)

    console.log(`Found ${products.length} bestseller products`)

    res.status(200).json({
      success: true,
      count,
      pages_count,
      current_page: page,
      data: products,
      rows: products,
    })
  } catch (error) {
    console.error("Error fetching bestseller products:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

module.exports = {
  upload,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductFilters,
  getFeaturedProducts,
  getBestsellerProducts,
}
