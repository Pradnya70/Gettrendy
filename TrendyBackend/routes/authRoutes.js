const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/authMiddleware")
const { register, login, getProfile, updateProfile } = require("../controller/authController")

// Public routes
router.post("/register", register)
router.post("/login", login)

// Protected routes
router.get("/me", auth, getProfile)
router.put("/profile", auth, updateProfile)

module.exports = router
