// Script to update subcategory image field names from subcategory_image to subcategory_logo
require("dotenv").config() // Load from current directory

const mongoose = require("mongoose")

async function updateSubcategoryImageFields() {
  try {
    console.log("🔧 Environment check:")
    console.log("MONGO_URI:", process.env.MONGO_URI ? "✓ Set" : "✗ Missing")

    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in .env file")
      process.exit(1)
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ Connected to MongoDB")

    const db = mongoose.connection.db

    // Find subcategories with old field name
    const subcategoriesWithOldField = await db
      .collection("subcategories")
      .find({ subcategory_image: { $exists: true } })
      .toArray()

    if (subcategoriesWithOldField.length > 0) {
      console.log(`Found ${subcategoriesWithOldField.length} subcategories with old field name`)

      // Update field name from subcategory_image to subcategory_logo
      const result = await db.collection("subcategories").updateMany({ subcategory_image: { $exists: true } }, [
        {
          $set: {
            subcategory_logo: "$subcategory_image",
          },
        },
        {
          $unset: "subcategory_image",
        },
      ])

      console.log(`✅ Updated ${result.modifiedCount} subcategories`)
    } else {
      console.log("✅ All subcategories already use the correct field name")
    }

    await mongoose.disconnect()
    console.log("👋 Disconnected from MongoDB")
  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  }
}

updateSubcategoryImageFields()
