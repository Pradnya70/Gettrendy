const cloudinary = require("cloudinary").v2

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Test the connection
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping()
    console.log("✅ Cloudinary connection successful:", result)
    return true
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error)
    console.error("Please check your Cloudinary credentials in .env file:")
    console.error("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing")
    console.error("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing")
    console.error("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing")
    return false
  }
}

// Helper function to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  try {
    if (!url || typeof url !== "string") return null

    // Handle both HTTP and HTTPS URLs
    // Example URL: https://res.cloudinary.com/your-cloud/image/upload/v1234567890/getTrendy/products/product_1234567890_name.jpg
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
const deleteImage = async (publicId) => {
  try {
    if (!publicId) return null

    console.log("🗑️ Deleting image from Cloudinary:", publicId)
    const result = await cloudinary.uploader.destroy(publicId)
    console.log("✅ Image deleted:", result)
    return result
  } catch (error) {
    console.error("❌ Error deleting image:", error)
    throw error
  }
}

// Helper function to upload image to Cloudinary
const uploadImage = async (filePath, options = {}) => {
  try {
    console.log("📤 Uploading image to Cloudinary:", filePath)
    const result = await cloudinary.uploader.upload(filePath, {
      quality: "auto",
      fetch_format: "auto",
      ...options,
    })
    console.log("✅ Image uploaded:", result.secure_url)
    return result
  } catch (error) {
    console.error("❌ Error uploading image:", error)
    throw error
  }
}

// Test connection on module load
testCloudinaryConnection()

module.exports = {
  cloudinary,
  testCloudinaryConnection,
  extractPublicIdFromUrl,
  deleteImage,
  uploadImage,
}
