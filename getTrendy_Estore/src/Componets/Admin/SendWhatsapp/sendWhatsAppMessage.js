const axios = require("axios");

async function sendWhatsAppMessage(phone, templateName, variables) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  const data = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: variables.map(value => ({ type: "text", text: value })),
        },
      ],
    },
  };

  try {
    await axios.post(`https://graph.facebook.com/v17.0/${phoneId}/messages`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("WhatsApp message sent to", phone);
  } catch (err) {
    console.error("WhatsApp error:", err.response?.data || err.message);
  }
}

module.exports = { sendWhatsAppMessage };
