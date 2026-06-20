const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    position: {
        type: String,
        default: "Top"
    },
    placement: {
        type: String,
        default: "Home Page"
    },
    fromDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Banner', bannerSchema);
