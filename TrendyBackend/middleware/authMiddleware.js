const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Middleware to protect all authenticated routes
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const token = authHeader.replace("Bearer ", "")

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    console.log("Token decoded:", decoded)

    // Fetch user from DB, excluding password
    const user = await User.findById(decoded.id || decoded.userId || decoded._id).select("-password")

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    console.log("User found in auth middleware:", { id: user._id, role: user.role })

    req.user = user // Attach user object to request
    next()
  } catch (err) {
    console.error("JWT verification failed:", err.message)
    res.status(401).json({ message: "Token is not valid" })
  }
}

// Middleware to allow only admin users
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user && req.user.role === "admin") {
        console.log("Admin auth successful for user:", req.user._id)
        next()
      } else {
        res.status(403).json({ message: "Access denied. Admin privileges required." })
      }
    })
  } catch (error) {
    console.error("Admin auth error:", error)
    res.status(500).json({ message: "Server error in admin authentication" })
  }
}

// Middleware to allow only regular (non-admin) users
const userAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user && req.user.role === "user") {
        next()
      } else {
        res.status(403).json({ message: "Access denied. User privileges required." })
      }
    })
  } catch (error) {
    console.error("User auth error:", error)
    res.status(500).json({ message: "Server error in user authentication" })
  }
}

// Also export as protect for compatibility
const protect = auth

module.exports = { auth, adminAuth, userAuth, protect }
