const express = require("express");
const router = express.Router();
const shiprocketController = require("../controller/shiprocketController");


// Get all Shiprocket orders
router.get("/orders", shiprocketController.fetchShiprocketOrders);

// Get tracking by AWB number
router.get("/track/:awb", shiprocketController.fetchTracking);

module.exports = router;
