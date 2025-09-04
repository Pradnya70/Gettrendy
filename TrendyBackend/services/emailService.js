// emailService.js
const nodemailer = require("nodemailer");

/**
 * Gmail Email Service using App Password
 * Configure with environment variables:
 * - EMAIL_USER: your-gmail@gmail.com
 * - EMAIL_PASS: 16-digit app password from Gmail
 * - ADMIN_EMAIL: admin@yourdomain.com (optional, defaults to EMAIL_USER)
 */
const createTransporter = () => {
  if (process.env.NODE_ENV === "development") {
    // 👇 Stream transport: email will not be sent, only printed to console
    return nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }

  // 👇 Real Gmail transporter (production)
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};


/**
 * Send email with Gmail
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", result.messageId);
    return true;
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    return false;
  }
};

/**
 * Order confirmation email to customer
 */
const sendOrderConfirmationToUser = async (email, order) => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2c3e50;">Thank You for Your Order, ${
        order.address.fullName || "Customer"
      }!</h2>
      <p>Your order has been placed successfully. Below are the details of your purchase:</p>
      
      <h3 style="color: #16a085;">Order Details:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Product</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">${
                item.name
              }</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${
                item.quantity
              }</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">₹${item.price?.toFixed(
                2
              )}</td>
            </tr>`
            )
            .join("")}
          <tr style="background-color: #f8f9fa; font-weight: bold;">
            <td colspan="2" style="border: 1px solid #ddd; padding: 10px; text-align: right;">Total Amount:</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: right; color: #28a745;">₹${order.totalAmount.toFixed(
              2
            )}</td>
          </tr>
        </tbody>
      </table>
      
      <h3 style="color: #16a085;">Delivery Address:</h3>
      <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
        ${order.address.fullName}<br>
        ${order.address.street}<br>
        ${order.address.city}, ${order.address.state} ${
    order.address.postcode
  }<br>
        Phone: ${order.address.phone}
      </p>
      
      <p>We will notify you once your order is shipped.</p>
      <p>Thank you for choosing GetTrendy!</p>
    </div>
  `;

  return await sendEmail(
    email,
    "🎉 Order Confirmation - Thank You for Your Purchase!",
    html
  );
};

/**
 * Order confirmation email to customer (legacy function for backward compatibility)
 */
const sendOrderConfirmation = async (email, items, totalAmount, address) => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2c3e50;">Thank You for Your Order, ${
        address.fullName || "Customer"
      }!</h2>
      <p>Your order has been placed successfully. Below are the details of your purchase:</p>
      
      <h3 style="color: #16a085;">Order Details:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Product</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">${
                item.name
              }</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${
                item.quantity
              }</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">₹${item.price?.toFixed(
                2
              )}</td>
            </tr>`
            )
            .join("")}
          <tr style="background-color: #f8f9fa; font-weight: bold;">
            <td colspan="2" style="border: 1px solid #ddd; padding: 10px; text-align: right;">Total Amount:</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: right; color: #28a745;">₹${totalAmount.toFixed(
              2
            )}</td>
          </tr>
        </tbody>
      </table>
      
      <h3 style="color: #16a085;">Delivery Address:</h3>
      <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
        ${address.fullName}<br>
        ${address.address}<br>
        ${address.city}, ${address.state} ${address.pincode}<br>
        Phone: ${address.phone}
      </p>
      
      <p>We will notify you once your order is shipped.</p>
      <p>Thank you for choosing GetTrendy!</p>
    </div>
  `;

  return await sendEmail(
    email,
    "🎉 Order Confirmation - Thank You for Your Purchase!",
    html
  );
};

/**
 * Notify admin of new order
 */
const sendNewOrderNotificationToAdmin = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2c3e50;">🛒 New Order Received</h2>
      <p>A new order has been placed by <strong>${
        order.address.fullName
      }</strong> (${order.address.email}).</p>
      
      <h3 style="color: #16a085;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8f8f8;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Products</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Quantity</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item) => `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                item.name
              }</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
                item.quantity
              }</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${item.price?.toFixed(
                2
              )}</td>
            </tr>`
            )
            .join("")}
          <tr style="background-color: #f8f8f8; font-weight: bold;">
            <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total Amount:</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #28a745;">₹${order.totalAmount.toFixed(
              2
            )}</td>
          </tr>
        </tbody>
      </table>
      
      <h3 style="color: #16a085;">Customer Details</h3>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Customer:</strong> ${order.address.fullName}</p>
      <p><strong>Email:</strong> ${order.address.email}</p>
      <p><strong>Phone:</strong> ${order.address.phone}</p>
      
      <p style="margin-top: 20px;">Please review the order details in the admin panel.</p>
    </div>
  `;

  return await sendEmail(adminEmail, `🛒 New Order - ${order.orderId}`, html);
};

/**
 * Password reset OTP email
 */
const sendPasswordResetOtp = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2c3e50;">🔑 Password Reset Request</h2>
      <p>You have requested to reset your password for your GetTrendy account.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
        <h3 style="color: #16a085; margin: 0;">Your OTP Code</h3>
        <p style="font-size: 24px; font-weight: bold; color: #28a745; margin: 10px 0;">${otp}</p>
        <p style="margin: 0; font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
      </div>
      
      <p><strong>Important:</strong></p>
      <ul>
        <li>This OTP is valid for 10 minutes only</li>
        <li>Do not share this code with anyone</li>
        <li>If you didn't request this, please ignore this email</li>
      </ul>
      
      <p>Thank you,<br><strong>GetTrendy Team</strong></p>
    </div>
  `;

  return await sendEmail(email, "🔑 Password Reset OTP - GetTrendy", html);
};

/**
 * Contact form notification to admin
 */
const sendContactForm = async (contact) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2c3e50;">📩 New Contact Message</h2>
      <p>A new message has been submitted through the contact form.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #16a085; margin-top: 0;">Message Details</h3>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Subject:</strong> ${contact.subject || "No Subject"}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: white; padding: 15px; border-radius: 3px; border-left: 4px solid #16a085;">
          ${contact.message}
        </div>
      </div>
      
      <p>Please respond to this inquiry as soon as possible.</p>
    </div>
  `;

  return await sendEmail(
    adminEmail,
    `📩 Contact Form - ${contact.subject || "New Message"}`,
    html
  );
};

module.exports = {
  sendOrderConfirmation,
  sendOrderConfirmationToUser,
  sendNewOrderNotificationToAdmin,
  sendPasswordResetOtp,
  sendContactForm,
};
