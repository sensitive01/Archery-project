const mongoose = require('mongoose');
const Program = require('../models/Program');

// Helper: convert weekday names to numbers (0=Sun ... 6=Sat)
const parseDaysToNumbers = (days) => {
  const map = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return days.map(d => map[d.toLowerCase()]).filter(v => v !== undefined);
};

// Generate an array of Date objects for upcoming sessions
const generateSessionDates = (total, dayNumbers, start) => {
  const dates = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0); // midnight
  while (dates.length < total) {
    if (dayNumbers.includes(cur.getDay())) {
      dates.push(new Date(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
  days: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  }],
  time: { type: String, required: true }, // e.g. "08:00 AM - 09:30 AM"
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Ref to User(Coach)
  capacity: { type: Number, default: 20 },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  batchId: { type: String, unique: true, sparse: true },
  location: { type: String },
  startDate: { type: Date, required: true },
  // Persisted concrete session dates
  sessionDates: { type: [Date], default: [] },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate batchId (ARB + 6 digits) before saving
batchSchema.pre('save', async function () {
  if (!this.batchId) {
    let unique = false;
    let generatedId = '';
    while (!unique) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
      generatedId = `ARB${randomDigits}`;
      const existing = await mongoose.models.Batch.findOne({ batchId: generatedId });
      if (!existing) {
        unique = true;
      }
    }
    this.batchId = generatedId;
  }

  // Re‑compute sessionDates when scheduling fields change
  if (this.isNew || this.isModified('days') || this.isModified('startDate') || this.isModified('program')) {
    // Fetch totalClasses from linked program
    const prog = await Program.findById(this.program).select('totalClasses');
    if (prog) {
      const dayNumbers = parseDaysToNumbers(this.days);
      this.sessionDates = generateSessionDates(prog.totalClasses, dayNumbers, this.startDate);
    }
  }
});

module.exports = mongoose.model('Batch', batchSchema);
