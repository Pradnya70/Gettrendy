const axios = require("axios")

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD
const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external"

let token = null
let tokenExpiry = null

// Authenticate with Shiprocket
async function authenticate() {
  try {
    // Check if token is still valid
    if (token && tokenExpiry && new Date() < tokenExpiry) {
      return token
    }

    console.log("Authenticating with Shiprocket...")

    if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
      throw new Error("Shiprocket credentials not configured")
    }

    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
    })

    if (response.data && response.data.token) {
      token = response.data.token
      // Set token expiry to 23 hours from now (tokens usually expire in 24 hours)
      tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000)
      console.log("Shiprocket authentication successful")
      return token
    } else {
      throw new Error("Invalid response from Shiprocket authentication")
    }
  } catch (error) {
    console.error("Shiprocket authentication error:", error.response?.data || error.message)
    token = null
    tokenExpiry = null
    throw new Error(`Shiprocket authentication failed: ${error.response?.data?.message || error.message}`)
  }
}

// Create order in Shiprocket
async function createOrder(orderData) {
  try {
    console.log("Creating Shiprocket order...")

    // Ensure we have a valid token
    const authToken = await authenticate()

    // Validate required fields
    if (!orderData.order_id || !orderData.billing_customer_name || !orderData.billing_phone) {
      throw new Error("Missing required order data for Shiprocket")
    }

    // Prepare the order data for Shiprocket API
    const shiprocketOrderData = {
      order_id: orderData.order_id,
      order_date: orderData.order_date || new Date().toISOString().slice(0, 19).replace("T", " "),
      pickup_location: orderData.pickup_location || "Primary",
      billing_customer_name: orderData.billing_customer_name,
      billing_last_name: orderData.billing_last_name || "",
      billing_address: orderData.billing_address,
      billing_address_2: orderData.billing_address_2 || "",
      billing_city: orderData.billing_city,
      billing_pincode: orderData.billing_pincode,
      billing_state: orderData.billing_state,
      billing_country: orderData.billing_country || "India",
      billing_email: orderData.billing_email,
      billing_phone: orderData.billing_phone,
      shipping_is_billing: orderData.shipping_is_billing || true,
      shipping_customer_name: orderData.shipping_customer_name || orderData.billing_customer_name,
      shipping_last_name: orderData.shipping_last_name || orderData.billing_last_name || "",
      shipping_address: orderData.shipping_address || orderData.billing_address,
      shipping_address_2: orderData.shipping_address_2 || orderData.billing_address_2 || "",
      shipping_city: orderData.shipping_city || orderData.billing_city,
      shipping_pincode: orderData.shipping_pincode || orderData.billing_pincode,
      shipping_country: orderData.shipping_country || orderData.billing_country || "India",
      shipping_state: orderData.shipping_state || orderData.billing_state,
      shipping_email: orderData.shipping_email || orderData.billing_email,
      shipping_phone: orderData.shipping_phone || orderData.billing_phone,
      order_items: orderData.order_items,
      payment_method: orderData.payment_method || "Prepaid",
      shipping_charges: orderData.shipping_charges || 0,
      giftwrap_charges: orderData.giftwrap_charges || 0,
      transaction_charges: orderData.transaction_charges || 0,
      total_discount: orderData.total_discount || 0,
      sub_total: orderData.sub_total,
      length: orderData.length || 10,
      breadth: orderData.breadth || 15,
      height: orderData.height || 20,
      weight: orderData.weight || 0.5,
    }

    console.log("Shiprocket order data:", JSON.stringify(shiprocketOrderData, null, 2))

    const response = await axios.post(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, shiprocketOrderData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    })

    console.log("Shiprocket order created successfully:", response.data)
    return response.data
  } catch (error) {
    console.error("Shiprocket order creation error:", error.response?.data || error.message)

    // If authentication error, clear token and retry once
    if (error.response?.status === 401) {
      console.log("Token expired, retrying authentication...")
      token = null
      tokenExpiry = null

      // Retry once with new token
      try {
        const authToken = await authenticate()
        const response = await axios.post(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, orderData, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        })
        return response.data
      } catch (retryError) {
        throw new Error(
          `Shiprocket order creation failed after retry: ${retryError.response?.data?.message || retryError.message}`,
        )
      }
    }

    throw new Error(`Shiprocket order creation failed: ${error.response?.data?.message || error.message}`)
  }
}

// Get order tracking details
async function trackOrder(orderId) {
  try {
    const authToken = await authenticate()

    const response = await axios.get(`${SHIPROCKET_BASE_URL}/courier/track/awb/${orderId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    return response.data
  } catch (error) {
    console.error("Shiprocket tracking error:", error.response?.data || error.message)
    throw new Error(`Shiprocket tracking failed: ${error.response?.data?.message || error.message}`)
  }
}

// Cancel order
async function cancelOrder(orderId) {
  try {
    const authToken = await authenticate()

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/orders/cancel`,
      { ids: [orderId] },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    return response.data
  } catch (error) {
    console.error("Shiprocket cancel order error:", error.response?.data || error.message)
    throw new Error(`Shiprocket order cancellation failed: ${error.response?.data?.message || error.message}`)
  }
}

module.exports = {
  authenticate,
  createOrder,
  trackOrder,
  cancelOrder,
}
