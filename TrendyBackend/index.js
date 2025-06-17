const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const HOST = "0.0.0.0"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://142.93.220.230:3000", "https://gettrendy.in"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-access-token",
      "Cache-Control",
      "Pragma",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
    exposedHeaders: ["Cache-Control", "Pragma"],
    credentials: true,
    maxAge: 86400,
  }),
)

// Middleware
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Connect to MongoDB (remove deprecated options)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

 console.log('🔍 MONGO_URI =', process.env.MONGO_URI);
 
// Import Routes
const authRoutes = require("./routes/authRoutes")
const productRoutes = require("./routes/productRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const subCategoryRoutes = require("./routes/subCategoryRoutes")
const cartRoutes = require("./routes/cartRoutes")
const orderRoutes = require("./routes/orderRoutes")
const issueRoutes = require("./routes/issueRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const uploadRoute = require("./routes/uploadRoutes")
const userRoutes = require("./routes/userRoutes")
const razorpayRoutes = require("./routes/razorpayRoutes")

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/category", categoryRoutes)
app.use("/api/subcategory", subCategoryRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/upload", uploadRoute)
app.use("/api/issues", issueRoutes)
app.use("/api/review", reviewRoutes)
app.use("/api/users", userRoutes)
app.use("/api/razorpay", razorpayRoutes)

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running...")
})

// Test route for API
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working",
    timestamp: new Date().toISOString(),
    routes: ["GET /api/category", "POST /api/category", "GET /api/subcategory", "POST /api/subcategory"],
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// 404 handler
app.use((req, res) => {
  // console.log(`404 - Route not found: ${req.method} ${req.url}`)
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server listening on http://${HOST}:${PORT}`)
  console.log("📋 Available routes:")
  console.log("   - GET /api/category")
  console.log("   - POST /api/category")
  console.log("   - GET /api/subcategory")
  console.log("   - POST /api/subcategory")
  console.log("   - GET /api/products")
  console.log("   - POST /api/auth/login")
  console.log("   - POST /api/auth/register")
})
