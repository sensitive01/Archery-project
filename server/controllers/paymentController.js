const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Order = require('../models/Order');
const nodemailer = require('nodemailer');
const { generateInvoicePdf } = require('../utils/invoiceGenerator');

// Initialize Razorpay with env vars or dummy for dev
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret'
});

exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100, // Amount in paise
            currency: "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7),
        };

        const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy';

        // If no keys or dummy keys, return a mock order
        if ((!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_dummy') && process.env.NODE_ENV !== 'production') {
            console.log("Mocking Razorpay Order");
            return res.json({
                id: "order_" + Math.random().toString(36).substring(7),
                currency: "INR",
                amount: amount * 100,
                key_id: 'rzp_test_dummy'
            });
        }

        const order = await instance.orders.create(options);
        // Combine order details with key_id for client use
        res.json(Object.assign({}, order, { key_id: keyId }));
    } catch (error) {
        // Fallback for dev if razorpay fails
        console.error("Razorpay Error:", error);
        res.status(500).json({ message: "Payment initialization failed", error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret')
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic || (process.env.RAZORPAY_KEY_ID === undefined)) {
            // If dev, let it pass
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.purchaseProduct = async (req, res) => {
    try {
        const {
            userId,
            studentId,
            equipmentId,
            amount,
            guestName,
            guestEmail,
            guestMobile,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature
        } = req.body;

        const isGuest = !userId;

        // Declare user at function scope so it's available throughout
        let user = null;

        if (isGuest) {
            if (!guestName || !guestEmail || !guestMobile || !equipmentId || !amount) {
                return res.status(400).json({ message: "Missing required fields for guest purchase (guestName, guestEmail, guestMobile, equipmentId, amount)" });
            }
        } else {
            if (!studentId || !equipmentId || !amount) {
                return res.status(400).json({ message: "Missing required fields (studentId, equipmentId, amount)" });
            }

            // Verify that the user exists and is a student
            user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
        }

        // Verify equipment exists and has stock
        const equipment = await Equipment.findById(equipmentId);
        if (!equipment) {
            return res.status(404).json({ message: "Equipment not found" });
        }

        if (equipment.availableQty <= 0) {
            return res.status(400).json({ message: "Equipment is out of stock" });
        }

        // If Razorpay keys are configured, verify signature
        const isRazorpayConfigured = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_dummy';
        if (isRazorpayConfigured && razorpayPaymentId && razorpayOrderId && razorpaySignature) {
            const body = razorpayOrderId + "|" + razorpayPaymentId;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret')
                .update(body.toString())
                .digest("hex");

            const isAuthentic = expectedSignature === razorpaySignature;
            if (!isAuthentic) {
                return res.status(400).json({ message: "Invalid payment signature verification failed" });
            }
        }

        // Decrement equipment stock atomically
        const updatedEquipment = await Equipment.findOneAndUpdate(
            { _id: equipmentId, availableQty: { $gt: 0 } },
            { $inc: { availableQty: -1 } },
            { new: true }
        );

        if (!updatedEquipment) {
            return res.status(400).json({ message: "Failed to purchase. Equipment might have just gone out of stock." });
        }

        // Create the order details
        const orderData = {
            equipmentId: equipmentId,
            amount: amount,
            razorpayPaymentId: razorpayPaymentId || `ARPAY${Date.now()}`,
            razorpayOrderId: razorpayOrderId || null,
            status: 'success',
            fulfillmentStatus: 'Pending',
            feeStatus: 'Paid',
            paymentMode: (razorpayPaymentId && razorpayPaymentId.startsWith('pay_')) ? 'Online' : 'Offline'
        };

        if (isGuest) {
            orderData.guestName = guestName;
            orderData.guestEmail = guestEmail;
            orderData.guestMobile = guestMobile;
        } else {
            orderData.user = userId;
            orderData.studentId = studentId;
        }

        const newOrder = await Order.create(orderData);

        // Notify Admin of Purchase
        try {
            const { createNotification } = require('./notificationController');
            const buyerName = isGuest ? guestName : user.firstName + ' ' + user.lastName;
            await createNotification({
                role: 'admin',
                title: 'New Product Purchase',
                message: `${buyerName} purchased ${equipment.name}.`,
                type: 'payment',
                link: '/admin/purchases'
            });
        } catch(err) { console.error('Notification error:', err); }

        // Send Invoice via Email
        setImmediate(async () => {
            try {
                const pdfBuffer = await generateInvoicePdf(newOrder, user, null, null, equipment);
                const buyerEmail = isGuest ? guestEmail : user.email;
                const buyerFirstName = isGuest ? guestName.split(' ')[0] : user.firstName;
                
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    },
                    tls: { rejectUnauthorized: false }
                });

                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                        <div style="background: linear-gradient(135deg, #0F172A, #1E40AF); border-radius: 8px 8px 0 0; padding: 30px; text-align: center; margin: -20px -20px 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px;">ARCHERY<span style="color: #ef4444;">ACADEMY</span></h1>
                            <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 5px 0 0;">Purchase Confirmation</p>
                        </div>
                        <div style="padding: 10px 10px 20px;">
                            <p style="font-size: 16px; color: #333;">Hi <strong>${buyerFirstName}</strong>,</p>
                            <p style="font-size: 14px; color: #555; line-height: 1.7;">Thank you for your purchase! We have successfully received your payment for <strong>${equipment.name}</strong>. Your invoice is attached to this email.</p>
                            
                            <p style="font-size: 14px; color: #555; margin-top: 20px;">If you have any questions about your order, please reply to this email.</p>
                        </div>
                        <div style="text-align: center; padding: 15px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                            &copy; ${new Date().getFullYear()} Archery Academy. All rights reserved.
                        </div>
                    </div>
                `;

                const toEmail = isGuest ? guestEmail : user.email;

                await transporter.sendMail({
                    from: `"Archery Academy" <${process.env.EMAIL_USER}>`,
                    to: toEmail,
                    subject: `Your Receipt for ${equipment.name}`,
                    html: emailHtml,
                    attachments: [
                        {
                            filename: `Archery_Invoice_${newOrder.razorpayPaymentId || 'Receipt'}.pdf`,
                            content: pdfBuffer,
                            contentType: 'application/pdf'
                        }
                    ]
                });
                console.log(`[EMAIL SENT] Invoice sent to ${toEmail}`);
            } catch (emailErr) {
                console.error('[EMAIL ERROR] Failed to send purchase invoice:', emailErr.message);
            }
        });

        res.status(201).json({
            success: true,
            message: "Purchase completed successfully",
            order: newOrder,
            availableQty: updatedEquipment.availableQty
        });

    } catch (error) {
        console.error("Purchase Product Error:", error);
        res.status(500).json({ message: error.message || "Failed to process product purchase" });
    }
};

exports.getMyPurchases = async (req, res) => {
    try {
        const purchases = await Order.find({ user: req.user._id, equipmentId: { $exists: true } })
            .populate('equipmentId', 'name price')
            .sort({ createdAt: -1 });
        res.json(purchases);
    } catch (error) {
        console.error("Get My Purchases Error:", error);
        res.status(500).json({ message: "Failed to fetch purchases" });
    }
};
