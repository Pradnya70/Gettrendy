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
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false)
  }
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
      filter.Bestseller = true
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
      bestseller, // Use lowercase consistently
    } = req.body

    console.log("🔍 Backend (createProduct): Full req.body received:", req.body)
    console.log("🔍 Backend (createProduct): Raw values:")
    console.log(`- featured: "${featured}" (type: ${typeof featured})`)
    console.log(`- bestseller: "${bestseller}" (type: ${typeof bestseller})`)

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

    console.log("🔍 Backend (createProduct): Boolean conversion results:")
    console.log(`- isFeatured: ${isFeatured} (from "${featured}")`)
    console.log(`- isBestseller: ${isBestseller} (from "${bestseller}")`)

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
      Bestseller: isBestseller, // Database field name is 'Bestseller' with capital B
    })

    await product.save()

    // Populate the response
    const populatedProduct = await Product.findById(product._id)
      .populate("category", "category_name")
      .populate("subcategory", "subcategory_name")

    console.log("🔍 Backend (createProduct): Product saved successfully:")
    console.log(`- featured: ${populatedProduct.featured}`)
    console.log(`- Bestseller: ${populatedProduct.Bestseller}`)

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
    console.log("🔍 Backend: Full req.body received:", req.body)
    const productId = req.params.id

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
      bestseller, // Use lowercase consistently
      remove_images,
    } = req.body

    console.log("🔍 Backend (updateProduct): Raw field values:")
    console.log(`- featured: "${featured}" (type: ${typeof featured})`)
    console.log(`- bestseller: "${bestseller}" (type: ${typeof bestseller})`)

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

    // Remove specified images
    if (remove_images) {
      const imagesToRemove = typeof remove_images === "string" ? [remove_images] : remove_images

      updatedImages = updatedImages.filter((img) => !imagesToRemove.includes(img))

      // Delete files from filesystem
      imagesToRemove.forEach((img) => {
        const filePath = path.join(__dirname, "..", img)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
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

    let isBestseller = product.Bestseller
    if (bestseller !== undefined) {
      isBestseller = stringToBoolean(bestseller)
    }

    console.log("🔍 Backend (updateProduct): Boolean conversion results:")
    console.log(`- isFeatured: ${isFeatured} (from "${featured}")`)
    console.log(`- isBestseller: ${isBestseller} (from "${bestseller}")`)

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
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
        Bestseller: isBestseller, // Database field name is 'Bestseller' with capital B
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true },
    )
      .populate("category", "category_name")
      .populate("subcategory", "subcategory_name")

    console.log("🔍 Backend (updateProduct): Product updated successfully:")
    console.log(`- featured: ${updatedProduct.featured}`)
    console.log(`- Bestseller: ${updatedProduct.Bestseller}`)

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
    product.images.forEach((img) => {
      const filePath = path.join(__dirname, "..", img)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    })

    await Product.findByIdAndDelete(productId)

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

    const count = await Product.countDocuments({ Bestseller: true })
    const products = await Product.find({ Bestseller: true })
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
