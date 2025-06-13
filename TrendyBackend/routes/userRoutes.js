// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const { protect } = require("../middleware/authMiddleware");

// // Public routes
// router.post("/register", authController.signup);
// router.post("/login", authController.login);

// Protected routes
router.get("/profile", protect, authController.getProfile);
router.put("/profile", protect, authController.updateProfile);

// // Password reset routes
// router.post("/forgotpassword", authController.forgotPassword);
// router.post("/verifyotp", authController.verifyOtp);
// router.post("/resetpassword", authController.resetPassword);

module.exports = router;
