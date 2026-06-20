const mongoose = require('mongoose');
const Batch = require('../models/Batch');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/archery', { useNewUrlParser: true, useUnifiedTopology: true });
    const batches = await Batch.find({ students: { $exists: true, $not: { $size: 0 } } })
      .select('name students')
      .lean();
    if (batches.length === 0) {
      console.log('No batch has any assigned students.');
    } else {
      console.log(`Found ${batches.length} batch(es) with assigned students:`);
      batches.forEach(b => {
        console.log(`- Batch "${b.name}" (ID: ${b._id}) has ${b.students.length} student(s).`);
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('Error checking batches:', err);
    process.exit(1);
  }
})();
