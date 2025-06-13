const express = require("express")
const router = express.Router()
const subCategoryController = require("../controller/subCategoryController")
const { adminAuth } = require("../middleware/auth")

// Public routes
router.get("/", subCategoryController.getAllSubCategories)
router.get("/:id", subCategoryController.getSubCategoryById)

// Admin-only routes - with file upload middleware
router.post(
  "/",
  adminAuth,
  subCategoryController.upload.single("subcategory_image"),
  subCategoryController.createSubCategory,
)
router.put(
  "/:id",
  adminAuth,
  subCategoryController.upload.single("subcategory_image"),
  subCategoryController.updateSubCategory,
)
router.delete("/:id", adminAuth, subCategoryController.deleteSubCategory)

module.exports = router
