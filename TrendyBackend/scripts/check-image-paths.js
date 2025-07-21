// Script to check current image paths in database
require("dotenv").config() // Load from current directory

const mongoose = require("mongoose")

// Import models from current directory
const Category = require("../models/Category")
const SubCategory = require("../models/SubCategory")
const Product = require("../models/Product")

async function checkImagePaths() {
  try {
    console.log("🔧 Environment check:")
    console.log("MONGO_URI:", process.env.MONGO_URI ? "✓ Set" : "✗ Missing")
    console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing")

    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in .env file")
      process.exit(1)
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ Connected to MongoDB")

    console.log("\n📋 CATEGORY IMAGES:")
    const categories = await Category.find({ category_image: { $exists: true, $ne: null, $ne: "" } })
    console.log(`Found ${categories.length} categories with images`)

    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.category_name}`)
      console.log(`   Image: ${cat.category_image}`)
      console.log(`   Type: ${cat.category_image?.includes("cloudinary.com") ? "Cloudinary ✅" : "Local 📁"}`)
    })

    console.log("\n📋 SUBCATEGORY IMAGES:")
    const subcategories = await SubCategory.find({
      $or: [
        { subcategory_logo: { $exists: true, $ne: null, $ne: "" } },
        { subcategory_image: { $exists: true, $ne: null, $ne: "" } },
      ],
    })
    console.log(`Found ${subcategories.length} subcategories with images`)

    subcategories.forEach((sub, index) => {
      const imagePath = sub.subcategory_logo || sub.subcategory_image
      console.log(`${index + 1}. ${sub.subcategory_name}`)
      console.log(`   Image: ${imagePath}`)
      console.log(`   Field: ${sub.subcategory_logo ? "subcategory_logo" : "subcategory_image"}`)
      console.log(`   Type: ${imagePath?.includes("cloudinary.com") ? "Cloudinary ✅" : "Local 📁"}`)
    })

    console.log("\n📋 PRODUCT IMAGES:")
    const products = await Product.find({ images: { $exists: true, $size: { $gt: 0 } } }).limit(5)
    console.log(`Found ${products.length} products with images (showing first 5)`)

    products.forEach((prod, index) => {
      console.log(`${index + 1}. ${prod.product_name}`)
      prod.images.forEach((img, imgIndex) => {
        console.log(`   Image ${imgIndex + 1}: ${img}`)
        console.log(`   Type: ${img?.includes("cloudinary.com") ? "Cloudinary ✅" : "Local 📁"}`)
      })
    })

    await mongoose.disconnect()
    console.log("\n👋 Disconnected from MongoDB")
  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  }
}

checkImagePaths()
