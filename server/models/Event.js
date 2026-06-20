const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    enrolledAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, default: 'Main Arena' },
    maxParticipants: { type: Number, required: true },
    enrollments: [enrollmentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
