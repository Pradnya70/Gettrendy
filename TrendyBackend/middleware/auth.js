const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Middleware to protect all authenticated routes
const auth = async (req, res, next) => {
  try {
    let token

    // Check for token in Authorization header (Bearer token)
    const authHeader = req.header("Authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "")
    }

    // Check for token in x-access-token header (legacy support)
    if (!token) {
      token = req.header("x-access-token")
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      })
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    console.log("Token decoded:", decoded)

    // Fetch user from DB, excluding password
    const user = await User.findById(decoded.id || decoded.userId || decoded._id).select("-password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    console.log("User found in auth middleware:", { id: user._id, role: user.role })

    req.user = user // Attach user object to request
    next()
  } catch (err) {
    console.error("JWT verification failed:", err.message)
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    })
  }
}

// Middleware to allow only admin users
const adminAuth = async (req, res, next) => {
  try {
    // First run the auth middleware
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    // Check if user has admin role
    if (req.user && req.user.role === "admin") {
      console.log("Admin auth successful for user:", req.user._id)
      next()
    } else {
      console.log("Admin auth failed - user role:", req.user?.role)
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }
  } catch (error) {
    console.error("Admin auth error:", error)
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    })
  }
}

// Middleware to allow only regular (non-admin) users
const userAuth = async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    if (req.user && (req.user.role === "user" || req.user.role === "Customer")) {
      next()
    } else {
      res.status(403).json({
        success: false,
        message: "Access denied. User privileges required.",
      })
    }
  } catch (error) {
    console.error("User auth error:", error)
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    })
  }
}

// Also export as protect for compatibility
const protect = auth

module.exports = { auth, adminAuth, userAuth, protect }
