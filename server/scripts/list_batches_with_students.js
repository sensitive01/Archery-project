require('dotenv').config();
const mongoose = require('mongoose');
const Batch = require('../models/Batch');
const User = require('../models/User');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/archery';

(async () => {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const batches = await Batch.find({})
      .populate({
        path: 'students',
        select: 'firstName lastName email studentId',
        model: User,
      })
      .select('name days startDate sessionDates students')
      .lean();

    if (!batches.length) {
      console.log('🚫 No batches found in the database.');
      return;
    }

    console.log(`✅ Found ${batches.length} batch${batches.length > 1 ? 'es' : ''}:`);
    batches.forEach((b) => {
      const studentCount = b.students?.length || 0;
      console.log(`\n--- Batch: "${b.name}" (ID: ${b._id})`);
      console.log(`Scheduled days: ${b.days?.join(', ') || 'N/A'}`);
      console.log(`Start date: ${b.startDate?.toISOString().split('T')[0] || 'N/A'}`);
      console.log(`Students assigned: ${studentCount}`);
      if (studentCount > 0) {
        b.students.forEach((s, idx) => {
          console.log(`  ${idx + 1}. ${s.firstName} ${s.lastName} (Email: ${s.email}, StudentID: ${s.studentId})`);
        });
      } else {
        console.log('  (none)');
      }
    });
  } catch (err) {
    console.error('❌ Error querying batches:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
