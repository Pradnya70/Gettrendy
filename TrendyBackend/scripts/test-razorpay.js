#!/usr/bin/env node

// Test script to verify Razorpay configuration
const dotenv = require("dotenv")
const { validateEnv } = require("../config/validateEnv")
const { testRazorpayConnection } = require("../utils/razorpayHelper")

// Load environment variables
dotenv.config()

console.log("🧪 Testing Razorpay Configuration...\n")

// Test environment variables
console.log("1. Validating environment variables...")
if (!validateEnv()) {
  console.error("❌ Environment validation failed")
  process.exit(1)
}

// Test Razorpay connection
console.log("\n2. Testing Razorpay API connection...")
testRazorpayConnection()
  .then((success) => {
    if (success) {
      console.log("\n✅ All tests passed! Razorpay is configured correctly.")
      console.log("\n📋 Configuration Summary:")
      console.log(`   Key ID: ${process.env.RAZORPAY_KEY_ID}`)
      console.log(`   Environment: ${process.env.RAZORPAY_KEY_ID.includes("test") ? "Test" : "Live"}`)
    } else {
      console.log("\n❌ Razorpay configuration test failed")
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error("\n❌ Test failed with error:", error.message)
    process.exit(1)
  })
