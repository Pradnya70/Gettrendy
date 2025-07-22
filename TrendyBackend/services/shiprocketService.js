const axios = require("axios");

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

let token = null;

async function authenticate() {
  if (token) return token;
  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
    }
  );
  token = response.data.token;
  return token;
}

async function createOrder(orderData) {
  if (!token) await authenticate();
  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    orderData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

module.exports = { authenticate, createOrder };
