// Migration script to upload existing local images to Cloudinary
require("dotenv").config() // Load from current directory

const mongoose = require("mongoose")
const cloudinary = require("cloudinary").v2
const path = require("path")
const fs = require("fs")

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Import models from current directory
const Category = require("../models/Category")
const SubCategory = require("../models/SubCategory")
const Product = require("../models/Product")

async function uploadToCloudinary(localPath, folder, resourceType = "image") {
  try {
    console.log(`📤 Uploading ${localPath} to Cloudinary...`)

    // Try different possible paths for the file
    const possiblePaths = [
      localPath, // Original path
      path.join(__dirname, "..", localPath), // Backend relative
      path.join(__dirname, "..", "uploads", path.basename(localPath)), // Uploads folder
      path.join(__dirname, "..", "public", localPath), // Public folder
      path.join(__dirname, "..", "public", "uploads", path.basename(localPath)), // Public uploads
    ]

    let fullPath = null
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        fullPath = testPath
        break
      }
    }

    if (!fullPath) {
      console.log(`⚠️ File not found in any of these locations:`)
      possiblePaths.forEach((p) => console.log(`   - ${p}`))
      return null
    }

    console.log(`📁 Found file at: ${fullPath}`)

    const result = await cloudinary.uploader.upload(fullPath, {
      folder: `getTrendy/${folder}`,
      resource_type: resourceType,
      quality: "auto",
      fetch_format: "auto",
    })

    console.log(`✅ Uploaded successfully: ${result.secure_url}`)
    return result.secure_url
  } catch (error) {
    console.error(`❌ Error uploading ${localPath}:`, error.message)
    return null
  }
}

async function migrateCategoryImages() {
  console.log("\n🏷️ Migrating Category Images...")

  const categories = await Category.find({
    category_image: { $exists: true, $ne: null, $ne: "" },
  })

  console.log(`Found ${categories.length} categories with images`)

  for (const category of categories) {
    try {
      const localPath = category.category_image

      // Skip if already a Cloudinary URL
      if (localPath.includes("cloudinary.com")) {
        console.log(`⏭️ Skipping ${category.category_name} - already on Cloudinary`)
        continue
      }

      console.log(`\n📋 Processing category: ${category.category_name}`)
      console.log(`📁 Local path: ${localPath}`)

      const cloudinaryUrl = await uploadToCloudinary(localPath, "categories")

      if (cloudinaryUrl) {
        // Update database with Cloudinary URL
        await Category.findByIdAndUpdate(category._id, {
          category_image: cloudinaryUrl,
        })
        console.log(`✅ Updated ${category.category_name} with Cloudinary URL`)
      } else {
        console.log(`❌ Failed to upload image for ${category.category_name}`)
      }
    } catch (error) {
      console.error(`❌ Error processing category ${category.category_name}:`, error.message)
    }
  }
}

async function migrateSubcategoryImages() {
  console.log("\n🏷️ Migrating Subcategory Images...")

  const subcategories = await SubCategory.find({
    $or: [
      { subcategory_logo: { $exists: true, $ne: null, $ne: "" } },
      { subcategory_image: { $exists: true, $ne: null, $ne: "" } },
    ],
  })

  console.log(`Found ${subcategories.length} subcategories with images`)

  for (const subcategory of subcategories) {
    try {
      // Check both possible field names
      const localPath = subcategory.subcategory_logo || subcategory.subcategory_image

      if (!localPath) continue

      // Skip if already a Cloudinary URL
      if (localPath.includes("cloudinary.com")) {
        console.log(`⏭️ Skipping ${subcategory.subcategory_name} - already on Cloudinary`)
        continue
      }

      console.log(`\n📋 Processing subcategory: ${subcategory.subcategory_name}`)
      console.log(`📁 Local path: ${localPath}`)

      const cloudinaryUrl = await uploadToCloudinary(localPath, "subcategories")

      if (cloudinaryUrl) {
        // Update database with Cloudinary URL and ensure correct field name
        const updateData = { subcategory_logo: cloudinaryUrl }

        // Remove old field if it exists
        if (subcategory.subcategory_image) {
          updateData.$unset = { subcategory_image: "" }
        }

        await SubCategory.findByIdAndUpdate(subcategory._id, updateData)
        console.log(`✅ Updated ${subcategory.subcategory_name} with Cloudinary URL`)
      } else {
        console.log(`❌ Failed to upload image for ${subcategory.subcategory_name}`)
      }
    } catch (error) {
      console.error(`❌ Error processing subcategory ${subcategory.subcategory_name}:`, error.message)
    }
  }
}

async function migrateProductImages() {
  console.log("\n🛍️ Migrating Product Images...")

  const products = await Product.find({
    images: { $exists: true, $ne: null, $size: { $gt: 0 } },
  })

  console.log(`Found ${products.length} products with images`)

  for (const product of products) {
    try {
      console.log(`\n📋 Processing product: ${product.product_name}`)

      const updatedImages = []
      let hasChanges = false

      for (let i = 0; i < product.images.length; i++) {
        const localPath = product.images[i]

        // Skip if already a Cloudinary URL
        if (localPath.includes("cloudinary.com")) {
          console.log(`⏭️ Image ${i + 1} already on Cloudinary`)
          updatedImages.push(localPath)
          continue
        }

        console.log(`📁 Local path: ${localPath}`)

        const cloudinaryUrl = await uploadToCloudinary(localPath, "products")

        if (cloudinaryUrl) {
          updatedImages.push(cloudinaryUrl)
          hasChanges = true
          console.log(`✅ Uploaded image ${i + 1} for ${product.product_name}`)
        } else {
          // Keep original path if upload failed
          updatedImages.push(localPath)
          console.log(`❌ Failed to upload image ${i + 1} for ${product.product_name}`)
        }
      }

      // Update database if there were changes
      if (hasChanges) {
        await Product.findByIdAndUpdate(product._id, {
          images: updatedImages,
        })
        console.log(`✅ Updated ${product.product_name} with Cloudinary URLs`)
      }
    } catch (error) {
      console.error(`❌ Error processing product ${product.product_name}:`, error.message)
    }
  }
}

async function main() {
  try {
    console.log("🚀 Starting image migration to Cloudinary...")

    // Check environment variables
    console.log("🔧 Environment check:")
    console.log("MONGO_URI:", process.env.MONGO_URI ? "✓ Set" : "✗ Missing")
    console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing")
    console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing")
    console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing")

    if (!process.env.MONGO_URI || !process.env.CLOUDINARY_CLOUD_NAME) {
      console.error("❌ Missing required environment variables!")
      process.exit(1)
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ Connected to MongoDB")

    // Test Cloudinary connection
    const pingResult = await cloudinary.api.ping()
    console.log("✅ Cloudinary connection successful:", pingResult)

    // Run migrations
    await migrateCategoryImages()
    await migrateSubcategoryImages()
    await migrateProductImages()

    console.log("\n🎉 Migration completed!")
  } catch (error) {
    console.error("❌ Migration failed:", error.message)
  } finally {
    await mongoose.disconnect()
    console.log("👋 Disconnected from MongoDB")
  }
}

// Run the migration
main()
