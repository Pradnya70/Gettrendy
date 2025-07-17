// Environment variable validation utility
const validateEnv = () => {
  const requiredEnvVars = {
    MONGO_URI: "MongoDB connection string",
    JWT_SECRET: "JWT secret key for authentication",
    RAZORPAY_KEY_ID: "Razorpay Key ID from dashboard",
    RAZORPAY_KEY_SECRET: "Razorpay Key Secret from dashboard",
  }

  const missingVars = []
  const invalidVars = []

  Object.entries(requiredEnvVars).forEach(([key, description]) => {
    const value = process.env[key]

    if (!value) {
      missingVars.push({ key, description })
    } else if (value.trim() === "") {
      invalidVars.push({ key, description })
    }
  })

  if (missingVars.length > 0 || invalidVars.length > 0) {
    console.error("\n❌ Environment Variable Configuration Error\n")

    if (missingVars.length > 0) {
      console.error("Missing required environment variables:")
      missingVars.forEach(({ key, description }) => {
        console.error(`   ❌ ${key} - ${description}`)
      })
    }

    if (invalidVars.length > 0) {
      console.error("\nEmpty environment variables:")
      invalidVars.forEach(({ key, description }) => {
        console.error(`   ⚠️  ${key} - ${description}`)
      })
    }

    console.error("\n📝 Instructions:")
    console.error("1. Create a .env file in your backend root directory")
    console.error("2. Copy the contents from .env.example")
    console.error("3. Replace the placeholder values with your actual credentials")
    console.error("4. Get Razorpay credentials from: https://dashboard.razorpay.com/")
    console.error("\n")

    return false
  }

  // Validate Razorpay key format
  if (!process.env.RAZORPAY_KEY_ID.startsWith("rzp_")) {
    console.error("❌ Invalid RAZORPAY_KEY_ID format. It should start with 'rzp_'")
    return false
  }

  console.log("✅ All environment variables validated successfully")
  return true
}

module.exports = { validateEnv }
