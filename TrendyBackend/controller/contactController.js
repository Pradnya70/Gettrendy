const Contact = require("../models/contact")
const { sendContactFormEmail } = require("../services/emailService")

// @desc    Create a new contact message
// @route   POST /api/contact
// @access  Public
exports.createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      })
    }

    const contact = new Contact({ name, email, subject, message })
    await contact.save()

    // Send email notification to admin
    try {
      await sendContactFormEmail(contact)
      console.log("Contact form email sent to admin")
    } catch (emailError) {
      console.error("Error sending contact form email:", emailError)
      // Don't fail the contact creation if email fails
    }

    res.status(201).json({
      success: true,
      message: "Message received!",
      data: contact,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving message",
      error: error.message,
    })
  }
}

// (Optional) Get all contact messages (for admin)
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 })
    res.json({ success: true, contacts })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching contacts",
      error: error.message,
    })
  }
}

// Get contact messages by email
exports.getContactsByEmail = async (req, res) => {
  try {
    const { email } = req.params
    // Use case-insensitive search for email
    const contacts = await Contact.find({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    }).sort({ createdAt: -1 })

    res.json({ success: true, contacts })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching contacts",
      error: error.message,
    })
  }
}

// Mark all messages as read for a user (by email)
exports.markContactsAsRead = async (req, res) => {
  try {
    const { email } = req.params
    // Use case-insensitive search for email
    await Contact.updateMany(
      { email: { $regex: new RegExp(`^${email}$`, "i") }, read: false },
      { $set: { read: true } },
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking as read",
      error: error.message,
    })
  }
}
