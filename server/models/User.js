const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['student', 'coach', 'admin'],
        default: 'student'
    },
    needsPasswordReset: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },
    // Student specific
    studentId: { type: String, unique: true, sparse: true },
    employeeId: { type: String, unique: true, sparse: true },
    paymentId: { type: String },
    registrationType: { type: String, enum: ['self', 'guardian'], default: 'self' },
    guardianName: { type: String },
    guardianContact: { type: String }, // Parent / Guardian Contact Number
    mobile: { type: String }, // Participant Mobile Number

    // Additional Personal Details
    dob: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String },
    aadhaar: { type: String },

    // Category
    category: { type: String, enum: ['Student', 'Corporate Employee', 'Professional', 'Other'] },
    institutionName: { type: String },
    institutionDesignation: { type: String }, // Class / Course / Department / Designation

    // Contact Information
    address: { type: String }, // Residential Address

    // Medical & Fitness Information
    medicalConditions: { type: String },
    emergencyContactName: { type: String },
    emergencyContactNumber: { type: String },

    // Training Preferences
    preferredBatch: { type: String, enum: ['Weekday', 'Weekend'] },
    previousExperience: { type: Boolean, default: false },
    previousExperienceDetails: { type: String },

    enrolledPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    attendance: [{
        date: Date,
        status: { type: String, enum: ['present', 'absent', 'late', 'unattended'], default: 'unattended' },
        classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
        photo: { type: String, default: "" },
        checkInTime: { type: String, default: "" }  // HH:MM format captured at time of marking
    }],
    performanceScores: [{
        date: Date,
        score: Number,
        notes: String,
        distance: String
    }],
    // Coach specific
    specialization: [String],
    bio: String,
    experience: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    profilePic: { type: String, default: "" },

    createdAt: { type: Date, default: Date.now }
});

// Auto-generate employeeId (AREM + 6 digits) before saving
userSchema.pre('save', async function () {
    if (this.role === 'coach' && !this.employeeId) {
        let unique = false;
        let generatedId = '';
        while (!unique) {
            const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
            generatedId = `AREM${randomDigits}`;
            const existing = await mongoose.models.User.findOne({ employeeId: generatedId });
            if (!existing) {
                unique = true;
            }
        }
        this.employeeId = generatedId;
    }
});

module.exports = mongoose.model('User', userSchema);
