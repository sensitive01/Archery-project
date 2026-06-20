const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const PayAndPlay = require('../models/PayAndPlay');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/payandplay
// @desc    Create a new Pay & Play booking
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { contactName, mobileNumber, email, dayType, date, timeSlot, packageType, bookingType, persons, totalPrice, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

        if (!contactName || !mobileNumber || !email || !date || !timeSlot) {
            return res.status(400).json({ message: 'Please provide all required details' });
        }

        let paymentStatus = 'Pending';
        
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
            paymentStatus = 'Completed';
        } else if (razorpayPaymentId) {
             // For test/dev environments without keys but with mock payment IDs
             paymentStatus = 'Completed';
        }

        const newBooking = new PayAndPlay({
            contactName,
            mobileNumber,
            email,
            dayType,
            date,
            timeSlot,
            packageType,
            bookingType,
            persons,
            totalPrice,
            razorpayPaymentId: razorpayPaymentId || `ARPAY${Date.now()}`,
            razorpayOrderId: razorpayOrderId || null,
            paymentStatus
        });

        const savedBooking = await newBooking.save();
        
        // Notify Admin of Pay & Play Booking
        try {
            const { createNotification } = require('../controllers/notificationController');
            await createNotification({
                role: 'admin',
                title: 'New Pay & Play Booking',
                message: `${contactName} booked a session for ${date} at ${timeSlot}.`,
                type: 'payment',
                link: '/admin/payandplay'
            });
        } catch(err) { console.error('Notification error:', err); }

        res.status(201).json(savedBooking);
    } catch (err) {
        console.error('Error creating Pay & Play booking:', err);
        res.status(500).json({ message: 'Server error while creating booking' });
    }
});

// @route   GET /api/payandplay
// @desc    Get all Pay & Play bookings (for Admin)
// @access  Protected
router.get('/', protect, async (req, res) => {
    try {
        const { email } = req.query;
        let filter = {};
        if (email) {
            filter.email = email;
        }
        const bookings = await PayAndPlay.find(filter).sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (err) {
        console.error('Error fetching Pay & Play bookings:', err);
        res.status(500).json({ message: 'Server error while fetching bookings' });
    }
});

module.exports = router;
