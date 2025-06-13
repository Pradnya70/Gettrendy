const jwt = require("jsonwebtoken")
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer")

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role = "user" } = req.body

    console.log("Registration attempt:", { name, email, phone, role })

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role, // Include role in user creation
    })

    await user.save()

    console.log("User created successfully:", { id: user._id, role: user.role })

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "30d",
    })

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    })
  }
}

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    console.log("Login attempt for email:", email)

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      console.log("User not found for email:", email)
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    console.log("User found:", { id: user._id, role: user.role })

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      console.log("Password mismatch for user:", email)
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "30d",
    })

    console.log("Login successful for user:", { id: user._id, role: user.role })

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    })
  }
}

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user: user,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    })
  }
}

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    if (name) user.name = name
    if (phone) user.phone = phone

    await user.save()

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    })
  }
}

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: "Email is required" })
  }

  try {
    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found with this email address" })
    }

    // Generate OTP (6 digit number)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Save OTP to user document with expiry time (10 minutes)
    user.resetPasswordOtp = otp
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
    await user.save()

    // Create email transporter
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h1>Password Reset Request</h1>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    // For development/testing, return OTP in response
    if (process.env.NODE_ENV === "development") {
      return res.status(200).json({
        message: "OTP sent to your email",
        otp: otp, // Only include in development!
      })
    }

    res.status(200).json({ message: "OTP sent to your email" })
  } catch (error) {
    console.error("Forgot password error:", error.message)
    res.status(500).json({
      message: "Failed to send OTP email. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" })
  }

  try {
    // Find user by email and valid OTP
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    // Generate a temporary token for reset password
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    })

    res.status(200).json({
      message: "OTP verified successfully",
      resetToken,
    })
  } catch (error) {
    console.error("OTP verification error:", error.message)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Reset Password
exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body

  if (!resetToken || !newPassword) {
    return res.status(400).json({ message: "Reset token and new password are required" })
  }

  try {
    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET)

    // Find user by id
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.status(200).json({
      message: "Password updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Password reset error:", error.message)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get User Profile Detail
exports.getProfileDetail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json(user)
  } catch (error) {
    console.error("Get profile detail error:", error.message)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update User Profile Detail
exports.updateProfileDetail = async (req, res) => {
  try {
    const updates = req.body
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json(user)
  } catch (error) {
    console.error("Update profile detail error:", error.message)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get User Profile Detail
exports.getUserProfileDetail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json(user)
  } catch (error) {
    console.error("Get profile detail error:", error.message)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error" })
  }
}

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error" })
  }
}

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password") // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message })
  }
}

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update user fields if provided
    user.name = name || user.name
    user.email = email || user.email
    if (password) {
      user.password = password
    }

    await user.save()

    res.status(200).json({ message: "User profile updated successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message })
  }
}

// user profile details fetch
exports.getUserProfileDetail = async (req, res) => {
  try {
    const userProfile = await User.findById(req.user.id) // Find user by _id

    console.log(req.user.id)

    if (!userProfile) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(userProfile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// update user profile details
exports.updateUserProfileDetail = async (req, res) => {
  try {
    const userId = req.user.id // Extract user ID from request
    const updates = req.body // Get fields to update from request body

    // Find and update user by _id
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true, // Return updated document
      runValidators: true, // Ensure validation rules apply
    })

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ message: "Profile updated successfully", updatedUser })
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message })
  }
}
