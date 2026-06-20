const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentId: { type: String },
    guestName: { type: String },
    guestEmail: { type: String },
    guestMobile: { type: String },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
    amount: { type: Number, required: true }, // Stored in Rupees
    currency: { type: String, default: 'INR' },
    transactionId: { type: String, unique: true }, // unique format: AKP######
    razorpayPaymentId: { type: String }, // razorpay_payment_id
    razorpayOrderId: { type: String }, // razorpay_order_id
    status: { type: String, default: 'success' },
    fulfillmentStatus: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    feeStatus: { type: String, enum: ['FREE', 'Paid'], default: 'Paid' },
    paymentMode: { type: String, default: 'Offline' },
    paymentProof: { type: String },
    comments: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Auto-generate transactionId (AKP + 6 digits) before saving if not provided
orderSchema.pre('save', async function () {
    if (!this.transactionId) {
        let unique = false;
        let generatedId = '';
        while (!unique) {
            const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
            generatedId = `AKP${randomDigits}`;
            const existing = await this.constructor.findOne({ transactionId: generatedId });
            if (!existing) {
                unique = true;
            }
        }
        this.transactionId = generatedId;
    }
});

module.exports = mongoose.model('Order', orderSchema);
