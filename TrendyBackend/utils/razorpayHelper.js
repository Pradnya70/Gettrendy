const Razorpay = require("razorpay")

// Singleton pattern for Razorpay instance
let razorpayInstance = null

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    try {
      razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
      console.log("✅ Razorpay instance created successfully")
    } catch (error) {
      console.error("❌ Failed to create Razorpay instance:", error.message)
      throw error
    }
  }
  return razorpayInstance
}

// Test Razorpay connection
const testRazorpayConnection = async () => {
  try {
    const razorpay = getRazorpayInstance()

    // Try to fetch a small amount of data to test the connection
    await razorpay.orders.all({ count: 1 })
    console.log("✅ Razorpay connection test successful")
    return true
  } catch (error) {
    console.error("❌ Razorpay connection test failed:", error.message)

    if (error.statusCode === 401) {
      console.error("   Invalid Razorpay credentials. Please check your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET")
    } else if (error.statusCode === 400) {
      console.error("   Bad request to Razorpay API. Please check your credentials format")
    }

    return false
  }
}

module.exports = {
  getRazorpayInstance,
  testRazorpayConnection,
}
