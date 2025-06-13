const express = require("express")
const router = express.Router()
const cartController = require("../controller/cartController")
const { auth } = require("../middleware/auth")

// Protected routes - all require authentication
router.get("/", auth, cartController.getCart)
router.post("/add", auth, cartController.addItemToCart)
router.post("/remove", auth, cartController.removeItemFromCart)
router.post("/update", auth, cartController.updateItemQuantity)
router.delete("/clear", auth, cartController.clearCart)

module.exports = router
