const cloudinary = require("../utils/cloudinary")

// Upload image to Cloudinary
const uploadImage = async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    // The file has already been uploaded to Cloudinary by multer-storage-cloudinary
    // file.path is the Cloudinary URL, file.filename is the public_id
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: file.path,
        public_id: file.filename,
        secure_url: file.path.replace("http://", "https://"),
      },
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    res.status(500).json({
      success: false,
      message: "Error uploading image",
      error: error.message,
    })
  }
}

// Delete image from Cloudinary
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      })
    }

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === "ok") {
      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        data: result,
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to delete image",
        data: result,
      })
    }
  } catch (error) {
    console.error("Error deleting image:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    })
  }
}

// Delete multiple images from Cloudinary
const deleteMultipleImages = async (req, res) => {
  try {
    const { publicIds } = req.body

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array of Public IDs is required",
      })
    }

    const deletePromises = publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))

    const results = await Promise.all(deletePromises)

    res.status(200).json({
      success: true,
      message: "Images deletion process completed",
      data: results,
    })
  } catch (error) {
    console.error("Error deleting multiple images:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting images",
      error: error.message,
    })
  }
}

module.exports = {
  uploadImage,
  deleteImage,
  deleteMultipleImages,
}
