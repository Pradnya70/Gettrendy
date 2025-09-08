const { authenticate } = require("./services/shiprocketService");

require("dotenv").config();
console.log("EMAIL:", process.env.SHIPROCKET_EMAIL);
console.log("PASSWORD:", process.env.SHIPROCKET_PASSWORD);


(async () => {
  try {
    const token = await authenticate();
    console.log("✅ Shiprocket Auth Successful!");
    console.log("Token:", token);
  } catch (error) {
    console.error("❌ Shiprocket Auth Failed:", error.message);
  }
})();
