const express = require("express")
const router = express.Router()
const shiprocketController = require("../controller/shiprocketController")

// Get all Shiprocket orders
router.get("/orders", shiprocketController.fetchShiprocketOrders)

// Get tracking by AWB number
router.get("/track/:awb", shiprocketController.fetchTracking)

// Create Shiprocket order (used by checkout and replacements)
router.post("/orders/shiprocket-order", shiprocketController.createShiprocketOrder)

module.exports = router
