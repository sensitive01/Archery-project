const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    itemCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }],
    price: { type: Number, required: true },
    qty: { type: Number, required: true }, // acts as total stock
    availableQty: { type: Number }, // acts as current available stock
    category: { type: String, required: true, default: "Uncategorized" },
    subCategory: { type: String },
    specifications: [{
        type: { type: String }, // "type" is a reserved word in Mongoose, defining it this way lets us use it as a field name
        value: { type: String }
    }],
    active: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-sync availableQty and auto-generate itemCode (ARP + 6 digits) before saving
equipmentSchema.pre('save', async function () {
    if (this.isNew) {
        if (this.availableQty === undefined || this.availableQty === null) {
            this.availableQty = this.qty;
        }
    } else if (this.isModified('qty')) {
        try {
            const original = await this.constructor.findById(this._id);
            if (original) {
                const diff = this.qty - original.qty;
                if (!this.isModified('availableQty')) {
                    this.availableQty = Math.max(0, (this.availableQty ?? original.qty) + diff);
                }
            }
        } catch (err) {
            console.error("Error adjusting availableQty in pre-save hook:", err);
        }
    }

    if (!this.itemCode) {
        let unique = false;
        let generatedId = '';
        while (!unique) {
            const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
            generatedId = `ARP${randomDigits}`;
            const existing = await this.constructor.findOne({ itemCode: generatedId });
            if (!existing) {
                unique = true;
            }
        }
        this.itemCode = generatedId;
    }
});

module.exports = mongoose.model('Equipment', equipmentSchema);

