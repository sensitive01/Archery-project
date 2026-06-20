const User = require('../models/User');
const Program = require('../models/Program');
const Order = require('../models/Order');
const Batch = require('../models/Batch');

const getISTDateString = (dateInput) => {
    if (!dateInput) return "";
    const dateObj = new Date(dateInput);
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(dateObj);
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalMembers = await User.countDocuments({ role: 'student' });
        const totalCoaches = await User.countDocuments({ role: 'coach' });
        const activeCourses = await Program.countDocuments({ active: true });

        const revenueResult = await Order.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Recent 5 students for enrollments
        const recentEnrollments = await User.find({ role: 'student' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('firstName lastName email createdAt');

        // Fetch students with recent absences (mock logic: finding students with > 2 absences in attendance array)
        // Since we might not have attendance data populated yet, this will likely return empty, which is correct (no dummy data).
        const lowAttendance = await User.find({
            role: 'student',
            'attendance.status': 'absent'
        }).limit(5).select('firstName lastName email attendance');

        res.json({
            totalMembers,
            totalRevenue,
            activeCourses,
            totalCoaches,
            recentEnrollments,
            lowAttendance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all transaction logs (Orders)
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Order.find()
            .populate('user', 'firstName lastName email mobile')
            .populate('programId', 'title')
            .populate('batchId', 'name')
            .populate('equipmentId', 'name price')
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fetch student list for attendance for a specific date or all dates
exports.getAttendanceList = async (req, res) => {
    try {
        const getAll = req.query.all === 'true';
        const queryDate = req.query.date;
        
        // Find all batches and populate the students
        const batches = await Batch.find()
            .populate({
                path: 'students',
                select: 'firstName lastName email mobile attendance'
            })
            .populate('program', 'title');

        const list = [];
        batches.forEach(batch => {
            if (batch.students && batch.students.length > 0) {
                batch.students.forEach(student => {
                    if (getAll) {
                        // Return all session dates for this batch
                        const sessionDates = batch.sessionDates && batch.sessionDates.length > 0
                            ? batch.sessionDates
                            : [new Date()]; // Fallback to current date if no sessions are defined yet

                        sessionDates.forEach(sessionDate => {
                            const dateStr = getISTDateString(sessionDate);
                            const attendanceRecord = student.attendance.find(att => {
                                if (!att.date) return false;
                                return getISTDateString(att.date) === dateStr;
                            });

                            let status = "Unattended";
                            let photo = "";
                            let checkInTime = "";
                            if (attendanceRecord && attendanceRecord.status) {
                                status = attendanceRecord.status.charAt(0).toUpperCase() + attendanceRecord.status.slice(1);
                                photo = attendanceRecord.photo || "";
                                checkInTime = attendanceRecord.checkInTime || "";
                            }

                            list.push({
                                id: `${student._id}_${batch._id}_${dateStr}`,
                                studentId: student._id,
                                batchId: batch._id,
                                courseId: batch.program ? batch.program._id : null,
                                courseTitle: batch.program ? batch.program.title : "Archery Program",
                                name: `${student.firstName} ${student.lastName}`,
                                batch: `${batch.name} - ${batch.time}`,
                                date: dateStr,
                                status: status,
                                photo: photo,
                                checkInTime: checkInTime,
                                studentAttendance: student.attendance
                            });
                        });
                    } else {
                        // Single date filter mode (default)
                        const targetDate = queryDate || new Date().toISOString().substring(0, 10);
                        const attendanceRecord = student.attendance.find(att => {
                            if (!att.date) return false;
                            const recordDateStr = getISTDateString(att.date);
                            return recordDateStr === targetDate;
                        });

                        let status = "Unattended";
                        let photo = "";
                        let checkInTime = "";
                        if (attendanceRecord && attendanceRecord.status) {
                            status = attendanceRecord.status.charAt(0).toUpperCase() + attendanceRecord.status.slice(1);
                            photo = attendanceRecord.photo || "";
                            checkInTime = attendanceRecord.checkInTime || "";
                        }

                        list.push({
                            id: `${student._id}_${batch._id}`,
                            studentId: student._id,
                            batchId: batch._id,
                            courseId: batch.program ? batch.program._id : null,
                            courseTitle: batch.program ? batch.program.title : "Archery Program",
                            name: `${student.firstName} ${student.lastName}`,
                            batch: `${batch.name} - ${batch.time}`,
                            date: targetDate,
                            status: status,
                            photo: photo,
                            checkInTime: checkInTime,
                            studentAttendance: student.attendance
                        });
                    }
                });
            }
        });

        res.json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update/Mark attendance for a student
exports.updateAttendance = async (req, res) => {
    try {
        const { studentId, date, status, photo } = req.body;
        if (!studentId || !date || !status) {
            return res.status(400).json({ message: "Missing required fields (studentId, date, status)" });
        }

        const validStatuses = ['present', 'absent', 'late', 'unattended'];
        const normalizedStatus = status.toLowerCase();
        if (!validStatuses.includes(normalizedStatus)) {
            return res.status(400).json({ message: "Invalid status. Must be one of Present, Absent, Late, Unattended" });
        }

        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Capture current IST time at the moment admin marks attendance
        const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000); // UTC + 5:30
        const hours = nowIST.getUTCHours().toString().padStart(2, '0');
        const minutes = nowIST.getUTCMinutes().toString().padStart(2, '0');
        const checkInTime = `${hours}:${minutes}`;

        // Find existing attendance for this date
        const targetDateStr = getISTDateString(date);
        const recordIndex = student.attendance.findIndex(att => {
            if (!att.date) return false;
            const recordDateStr = getISTDateString(att.date);
            return recordDateStr === targetDateStr;
        });

        if (recordIndex > -1) {
            student.attendance[recordIndex].status = normalizedStatus;
            student.attendance[recordIndex].checkInTime = checkInTime;
            if (photo !== undefined) {
                student.attendance[recordIndex].photo = photo;
            }
        } else {
            student.attendance.push({
                date: new Date(date),
                status: normalizedStatus,
                photo: photo || "",
                checkInTime
            });
        }

        await student.save();

        // Notify student about attendance update
        try {
            const { createNotification } = require('./notificationController');
            await createNotification({
                userId: studentId,
                role: 'student',
                title: 'Attendance Marked',
                message: `Your attendance for ${targetDateStr} has been marked as ${normalizedStatus}.`,
                type: 'attendance',
                link: '/dashboard'
            });
        } catch(err) { console.error('Notification error:', err); }

        res.json({ message: "Attendance updated successfully", studentId, date, status, photo, checkInTime });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order/transaction fulfillment status
exports.updateOrderFulfillment = async (req, res) => {
    try {
        const { orderId, fulfillmentStatus } = req.body;
        if (!orderId || !fulfillmentStatus) {
            return res.status(400).json({ message: "Missing required fields (orderId, fulfillmentStatus)" });
        }

        const validStatuses = ['Pending', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(fulfillmentStatus)) {
            return res.status(400).json({ message: "Invalid fulfillment status. Must be one of Pending, Completed, Cancelled" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.fulfillmentStatus = fulfillmentStatus;
        await order.save();

        res.json({ message: "Order fulfillment status updated successfully", orderId, fulfillmentStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

