const express = require("express")
const router = express.Router()
const { uploadImage, deleteImage, deleteMultipleImages } = require("../controller/uploadController")
const { generalUpload } = require("../middleware/multer")

// Routes
router.post("/image", generalUpload.single("file"), uploadImage)
router.post("/delete", deleteImage)
router.post("/delete-multiple", deleteMultipleImages)

module.exports = router
