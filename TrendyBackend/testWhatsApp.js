const axios = require("axios");

// Replace these with your actual values
const PHONE_ID = "YOUR_WHATSAPP_PHONE_NUMBER_ID"; // NOT WABA ID
const ACCESS_TOKEN = "EAAU2TGEXG88BPmDhRnNopq8iPY3SNfESmUqZCuN1BeEQQAECglFewpyJATTKQjEJoZBZBvy2FIAtRIOZCZBGy8R31HyNQeTFzhTAcdZAU3uJ9UnV2YSO75HKe3RVgwBPF5QeYXgJiU8N5J7axuofLvOQkmjdw1YRZC7RxZCwkELPjGjmI4IZCC5OIadHLH1a6EMNQ6QZDZD"; // Temporary or permanent token
const RECIPIENT_NUMBER = "918551000442"; // Full international format, no '+'

// Template parameters
const TEMPLATE_NAME = "order_confirmation"; // Make sure this template is approved
const TEMPLATE_PARAMS = ["Ritesh", "ORDER123", "2500"]; // Example values

async function sendWhatsAppMessage() {
  const data = {
    messaging_product: "whatsapp",
    to: RECIPIENT_NUMBER,
    type: "template",
    template: {
      name: TEMPLATE_NAME,
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: TEMPLATE_PARAMS.map(value => ({ type: "text", text: value })),
        },
      ],
    },
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_ID}/messages`,
      data,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Message sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
  }
}

sendWhatsAppMessage();
