const express = require("express")
const router = express.Router()
const productController = require("../controller/productController")
const { adminAuth } = require("../middleware/authMiddleware") // Fixed import path

// Public routes
router.get("/", productController.getAllProducts)
router.get("/featured", productController.getFeaturedProducts)
router.get("/bestseller", productController.getBestsellerProducts)
router.get("/filters/options", productController.getProductFilters)
router.get("/:id", productController.getProductById)

// Admin routes
router.post(
  "/",
  adminAuth,
  productController.upload.array("images", 3), // Max 3 images
  productController.createProduct,
)

router.put(
  "/:id",
  adminAuth,
  productController.upload.array("images", 3), // Max 3 images
  productController.updateProduct,
)

router.delete("/:id", adminAuth, productController.deleteProduct)

module.exports = router
