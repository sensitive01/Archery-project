const mongoose = require('mongoose');

const payAndPlaySchema = new mongoose.Schema({
    contactName: {
        type: String,
        required: true,
        trim: true
    },
    mobileNumber: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    dayType: {
        type: String,
        required: true
    },
    date: {
        type: String, // Stored as YYYY-MM-DD
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    packageType: {
        type: String,
        required: true
    },
    bookingType: { // Single | Shared
        type: String,
        required: true
    },
    persons: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Confirmed'
    },
    razorpayPaymentId: {
        type: String
    },
    razorpayOrderId: {
        type: String
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('PayAndPlay', payAndPlaySchema);
