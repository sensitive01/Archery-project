require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/archery';

(async () => {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    const count = await User.countDocuments({ role: 'student' });
    if (count === 0) {
      console.log('🚫 No student records found in the database.');
    } else {
      console.log(`✅ Found ${count} student${count > 1 ? 's' : ''} in the database.`);
    }
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
