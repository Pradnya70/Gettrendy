const express = require("express")
const router = express.Router()
const subCategoryController = require("../controller/subCategoryController")
const { subCategoryUpload } = require("../middleware/multer")
const { adminAuth } = require("../middleware/authMiddleware")

// Public routes
router.get("/", subCategoryController.getAllSubCategories)
router.get("/:id", subCategoryController.getSubCategoryById)

// Admin-only routes - with file upload middleware
router.post("/", adminAuth, subCategoryUpload.single("subcategory_logo"), subCategoryController.createSubCategory)

router.put("/:id", adminAuth, subCategoryUpload.single("subcategory_logo"), subCategoryController.updateSubCategory)

router.delete("/:id", adminAuth, subCategoryController.deleteSubCategory)

module.exports = router
