// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const { protect, adminAuth } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getProfile,
  updateProfile,
} = require("../controller/authController");

// // Public routes
// router.post("/register", authController.signup);
// router.post("/login", authController.login);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
// Get all users (admin only)
router.get("/", protect, adminAuth, getAllUsers);

// // Password reset routes
// router.post("/forgotpassword", authController.forgotPassword);
// router.post("/verifyotp", authController.verifyOtp);
// router.post("/resetpassword", authController.resetPassword);

module.exports = router;
