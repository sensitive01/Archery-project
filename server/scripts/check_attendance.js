require('dotenv').config({ path: 'e:/SensitiveTechnologies/Archery-website/server/.env' });
const mongoose = require('mongoose');
const adminController = require('../controllers/adminController');

const mongoUri = process.env.MONGO_URI;

const getISTDateString = (dateInput) => {
  if (!dateInput) return "";
  const dateObj = new Date(dateInput);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(dateObj);
};

(async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const req = { query: { date: '2026-06-15' } };
    let apiData = null;

    const res = {
      json: (data) => {
        apiData = data.find(item => item.name.includes("Abhishek"));
      },
      status: (code) => res
    };

    await adminController.getAttendanceList(req, res);

    if (!apiData) {
      console.log("Abhishek S data not returned by API.");
      return;
    }

    // Now get the batch session dates
    const User = require('../models/User');
    const Batch = require('../models/Batch');
    const userObj = await User.findById(apiData.studentId);
    const batchObj = await Batch.findById(userObj.batch);

    const dates = batchObj.sessionDates || [];
    const studentAttendance = apiData.studentAttendance || [];

    console.log("\nBatch Session Dates from DB (raw and formatted):");
    dates.forEach((d, idx) => {
      console.log(` - d [${idx}]: ${d.toISOString()} -> getISTDateString: ${getISTDateString(d)}`);
    });

    console.log("\nStudent Attendance from API:");
    studentAttendance.forEach((att, idx) => {
      console.log(` - att [${idx}]: ${new Date(att.date).toISOString()} -> getISTDateString: ${getISTDateString(att.date)} (status: ${att.status})`);
    });

    console.log("\nMapping Comparison Logic:");
    const sessionsList = dates.map((d, idx) => {
      const dateStr = getISTDateString(d);
      const attMatch = studentAttendance.find(att => {
        const attDateStr = getISTDateString(att.date);
        const match = attDateStr === dateStr;
        console.log(`   Comparing att.date [${attDateStr}] === session.date [${dateStr}] -> Match: ${match}`);
        return match;
      });
      const status = attMatch ? attMatch.status : "unattended";
      return {
        session: idx + 1,
        dateStr,
        status: status.charAt(0).toUpperCase() + status.slice(1)
      };
    });

    console.log("\nFinal mapped sessionsList:");
    console.log(sessionsList);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
})();
