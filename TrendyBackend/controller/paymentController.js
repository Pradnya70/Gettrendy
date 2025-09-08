const { stripe } = require('../config/paymentConfig'); // Stripe instance from the paymentConfig file
const Order = require('../models/Order'); // Order model to link orders with payments
const { sendEmail } = require('../services/emailService'); // Assuming you have an email service to notify users
const { createOrder } = require('../services/shiprocketService');


// Create a payment intent
const createPaymentIntent = async (req, res) => {
    try {
        const { orderId, amount } = req.body; // Order ID and amount to be charged (in cents)

        // Ensure the order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the amount matches the order total
        if (amount !== order.totalAmount) {
            return res.status(400).json({ message: 'Amount mismatch with order total' });
        }

        // Create a Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert the amount to cents (Stripe expects the amount in cents)
            currency: 'usd', // You can change this to your desired currency
            metadata: { orderId: orderId },
        });

        // Send the client secret to the frontend to complete the payment
        res.status(200).json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating payment intent' });
    }
};

// Confirm the payment (after receiving the payment method from the frontend)
const confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId, paymentMethodId } = req.body;

        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: paymentMethodId,
        });

        if (paymentIntent.status === 'succeeded') {
            // ✅ Update order as paid
            const order = await Order.findOneAndUpdate(
                { _id: paymentIntent.metadata.orderId },
                { paymentStatus: 'paid', paymentIntentId: paymentIntent.id, orderStatus: 'processing' },
                { new: true }
            );

            const user = await order.populate('userId');

            // ✅ Send to Shiprocket
            const shiprocketPayload = {
                order_id: order._id,
                order_date: new Date().toISOString(),
                billing_customer_name: user.name,
                billing_last_name: "",
                billing_address: user.address.line1,
                billing_address_2: user.address.line2 || "",
                billing_city: user.address.city,
                billing_pincode: user.address.pincode,
                billing_state: user.address.state,
                billing_country: "India",
                billing_email: user.email,
                billing_phone: user.phone,
                shipping_is_billing: true,
                order_items: order.items.map((item) => ({
                    name: item.productName,
                    sku: item.sku || `SKU-${item._id}`,
                    units: item.quantity,
                    selling_price: item.price,
                })),
                payment_method: "Prepaid",
                sub_total: order.totalAmount,
                length: 10,
                breadth: 15,
                height: 20,
                weight: 0.5,
            };

            try {
                const shipRes = await createOrder(shiprocketPayload);
                console.log("✅ Shiprocket order created:", shipRes);

                // save shipment info in order
               order.shiprocketOrderId = shipRes.order_id;
order.shiprocketShipmentId = shipRes.shipment_id;
order.trackingNumber = shipRes.awb_code;
order.courierName = shipRes.courier_company_id; // if you add it in schema
                await order.save();
            } catch (err) {
                console.error("❌ Failed to create Shiprocket order:", err.message);
            }

            // ✅ Email user
            sendEmail(user.email, 'Your order is confirmed',
                `Your order with ID: ${order._id} has been successfully paid and is now processing.`);

            res.status(200).json({ message: 'Payment confirmed, order pushed to Shiprocket', order });
        } else {
            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error confirming payment' });
    }
};

// Handle payment success (used for webhook)
const handlePaymentSuccess = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const order = await Order.findById(paymentIntent.metadata.orderId);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.paymentStatus = 'paid';
        order.paymentIntentId = paymentIntent.id;
        order.orderStatus = 'processing';
        await order.save();

        const user = await order.populate('userId');

        // ✅ Send order to Shiprocket
        const shiprocketPayload = {
            order_id: order._id,
            order_date: new Date().toISOString(),
            billing_customer_name: user.name,
            billing_last_name: "",
            billing_address: user.address.line1,
            billing_address_2: user.address.line2 || "",
            billing_city: user.address.city,
            billing_pincode: user.address.pincode,
            billing_state: user.address.state,
            billing_country: "India",
            billing_email: user.email,
            billing_phone: user.phone,
            shipping_is_billing: true,
            order_items: order.items.map((item) => ({
                name: item.productName,
                sku: item.sku || `SKU-${item._id}`,
                units: item.quantity,
                selling_price: item.price,
            })),
            payment_method: "Prepaid",
            sub_total: order.totalAmount,
            length: 10,
            breadth: 15,
            height: 20,
            weight: 0.5,
        };

        try {
            const shipRes = await createOrder(shiprocketPayload);
            console.log("✅ Shiprocket order created:", shipRes);

           order.shiprocketOrderId = shipRes.order_id;
order.shiprocketShipmentId = shipRes.shipment_id;
order.trackingNumber = shipRes.awb_code;
order.courierName = shipRes.courier_company_id; // if you add it in schema

            await order.save();
        } catch (err) {
            console.error("❌ Shiprocket order failed:", err.message);
        }

        sendEmail(user.email, 'Payment received and order is processing',
            `Your order with ID: ${order._id} has been successfully paid and is now processing.`);

        res.status(200).json({ message: 'Payment successful, order synced with Shiprocket', order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error handling payment success' });
    }
};

// Handle payment failure (optional, for example, to notify users of failed payments)
const handlePaymentFailure = (req, res) => {
    try {
        const { paymentIntentId } = req.body; // Payment intent ID from Stripe

        // Retrieve the payment intent from Stripe
        stripe.paymentIntents.retrieve(paymentIntentId).then(async (paymentIntent) => {
            if (!paymentIntent) {
                return res.status(404).json({ message: 'Payment intent not found' });
            }

            // Find the order associated with the payment and update its status
            const order = await Order.findById(paymentIntent.metadata.orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Mark the order as failed
            order.paymentStatus = 'failed';
            await order.save();

            // Send failure email to user
            const user = await order.populate('userId');
            sendEmail(user.email, 'Payment failed', `Unfortunately, your payment for order ID: ${order._id} failed. Please try again.`);

            res.status(400).json({ message: 'Payment failed' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error handling payment failure' });
    }
};

module.exports = {
    createPaymentIntent,
    confirmPayment,
    handlePaymentSuccess,
    handlePaymentFailure,
};
