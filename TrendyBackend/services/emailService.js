// emailService.js
const axios = require("axios");
const nodemailer = require("nodemailer");

/**
 * Primary: Send email with Brevo API
 */
const sendWithBrevo = async (to, subject, htmlContent) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.BREVO_SENDER_EMAIL, name: "Silksew" },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    console.log("✅ Brevo email sent:", response.data);
    return true;
  } catch (err) {
    console.error("❌ Brevo send error:", err.response?.data || err.message);
    return false;
  }
};

/**
 * Fallback: Send email with Gmail (App Password)
 */
const sendWithGmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    });

    console.log("✅ Gmail email sent successfully");
    return true;
  } catch (err) {
    console.error("❌ Gmail send error:", err.message);
    return false;
  }
};

/**
 * Unified email sender: Try Brevo → fallback to Gmail
 */
const sendEmail = async (to, subject, htmlContent) => {
  let sent = await sendWithBrevo(to, subject, htmlContent);
  if (!sent) {
    console.log("⚠️ Falling back to Gmail...");
    sent = await sendWithGmail(to, subject, htmlContent);
  }
  return sent;
};

/**
 * Example: Order confirmation to customer
 */
const sendOrderConfirmation = async (email, items, totalAmount, address) => {
  const html = `
    <h2>Thank You for Your Order, ${address.fullName || "Customer"}!</h2>
    <p>Your order has been placed successfully.</p>
    <table border="1" cellpadding="6" cellspacing="0" width="100%">
      <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
      ${items
        .map(
          (i) => `
        <tr>
          <td>${i.name}</td>
          <td align="center">${i.quantity}</td>
          <td align="right">₹${i.price?.toFixed(2)}</td>
        </tr>`
        )
        .join("")}
      <tr>
        <td colspan="2" align="right"><b>Total</b></td>
        <td align="right">₹${totalAmount.toFixed(2)}</td>
      </tr>
    </table>
    <p>We will notify you once your order is shipped.</p>
  `;

  return await sendEmail(email, "🎉 Order Confirmation", html);
};

/**
 * Example: Notify admin of new order
 */
const sendOrderNotificationToAdmin = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL;

  const html = `
    <h2>New Order Received</h2>
    <p><b>Order ID:</b> ${order.orderId}</p>
    <p><b>Customer:</b> ${order.address.fullName}</p>
    <p><b>Email:</b> ${order.address.email}</p>
    <p><b>Phone:</b> ${order.address.phone}</p>
    <p><b>Total:</b> ₹${order.totalAmount}</p>
  `;

  return await sendEmail(adminEmail, `🛒 New Order - ${order.orderId}`, html);
};

/**
 * Example: Forgot password OTP
 */
const sendPasswordResetOtp = async (email, otp) => {
  const html = `
    <h2>Password Reset</h2>
    <p>Your OTP is: <b>${otp}</b></p>
    <p>This code will expire in 10 minutes.</p>
  `;

  return await sendEmail(email, "🔑 Password Reset OTP", html);
};

/**
 * Example: Contact form
 */
const sendContactForm = async (contact) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL;

  const html = `
    <h2>New Contact Message</h2>
    <p><b>Name:</b> ${contact.name}</p>
    <p><b>Email:</b> ${contact.email}</p>
    <p><b>Subject:</b> ${contact.subject || "No Subject"}</p>
    <p><b>Message:</b> ${contact.message}</p>
  `;

  return await sendEmail(adminEmail, `📩 Contact Form - ${contact.subject || "Message"}`, html);
};

module.exports = {
  sendOrderConfirmation,
  sendOrderNotificationToAdmin,
  sendPasswordResetOtp,
  sendContactForm,
};
