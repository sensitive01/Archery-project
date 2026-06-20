const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
    courseId: { type: String, unique: true },
    title: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    description: String,
    duration: String,
    totalClasses: Number,
    ageGroup: String,
    equipment: String,
    schedule: String,
    sessionDuration: Number,
    fees: Number,
    features: [String],
    image: String,
    kits: [{
        name: String,
        qty: Number,
        price: Number
    }],
    active: { type: Boolean, default: true }
});

// Auto-generate courseId (ARC + 6 digits) before saving
programSchema.pre('save', async function () {
    if (!this.courseId) {
        let unique = false;
        let generatedId = '';
        while (!unique) {
            const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
            generatedId = `ARC${randomDigits}`;
            const existing = await mongoose.models.Program.findOne({ courseId: generatedId });
            if (!existing) {
                unique = true;
            }
        }
        this.courseId = generatedId;
    }
});

module.exports = mongoose.model('Program', programSchema);
