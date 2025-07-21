const express = require("express");
const router = express.Router();
const contactController = require("../controller/contactController");

router.post("/", contactController.createContact);
router.get("/user/:email", contactController.getContactsByEmail);
router.put("/user/:email/read", contactController.markContactsAsRead);

module.exports = router;
