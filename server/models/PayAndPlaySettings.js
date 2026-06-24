const mongoose = require('mongoose');

const timeRangeSchema = new mongoose.Schema({
    startHour: {
        type: Number,
        required: true,
        min: 0,
        max: 23
    },
    endHour: {
        type: Number,
        required: true,
        min: 1,
        max: 24
    }
}, { _id: false });

const payAndPlaySettingsSchema = new mongoose.Schema({
    weekdaySlots: {
        type: [timeRangeSchema],
        default: [{ startHour: 6, endHour: 9 }]
    },
    weekendSlots: {
        type: [timeRangeSchema],
        default: [{ startHour: 6, endHour: 9 }, { startHour: 16, endHour: 18 }]
    }
}, { timestamps: true });

module.exports = mongoose.model('PayAndPlaySettings', payAndPlaySettingsSchema);
