const express = require('express');
const router = express.Router();
const { saveAddress } = require('../controller/shippingController');

router.post('/save', saveAddress); // Save shipping address

module.exports = router;
