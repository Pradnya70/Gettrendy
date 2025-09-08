const { createOrder } = require("./services/shiprocketService");


async function test() {
  const payload = {
    order_id: "TEST125",
    billing_customer_name: "Ritesh",
    billing_phone: "9876543210",
    billing_email: "ritesh@test.com",
    billing_address: "Test Address",
    billing_city: "Pune",
    billing_state: "Maharashtra",
    billing_pincode: "411001",
    billing_country: "India",
    order_items: [
      {
        name: "Test Product",
        sku: "SKU123",
        units: 1,
        selling_price: 500,
      },
    ],
    payment_method: "Prepaid",
    sub_total: 500,
  };

  try {
    const res = await createOrder(payload);
    console.log("✅ Order created:", res);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

test();
