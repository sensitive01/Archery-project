const Batch = require('../models/Batch');
const User = require('../models/User');

// Create a new batch
exports.createBatch = async (req, res) => {
    try {
        const batch = await Batch.create(req.body);
        
        // Notify all students
        try {
            const { createNotification } = require('./notificationController');
            await createNotification({
                userId: null,
                role: 'student',
                title: 'New Batch Available',
                message: `A new batch "${batch.name}" has been created. Check it out!`,
                type: 'batch',
                link: '/dashboard'
            });
        } catch(err) { console.error('Notification error:', err); }

        res.status(201).json(batch);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all batches
exports.getAllBatches = async (req, res) => {
    try {
        const query = req.query.all === 'true' ? {} : { active: { $ne: false } };
        const batches = await Batch.find(query)
            .populate('students', 'firstName lastName studentId email mobile')
            .populate('program', 'title level duration fees description totalClasses ageGroup equipment schedule features image courseId active')
            .populate('coach', 'firstName lastName email mobile');
        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assign student to batch
exports.assignStudent = async (req, res) => {
    try {
        const { studentId } = req.body; // User _id
        const batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        if (batch.students.includes(studentId)) {
            return res.status(400).json({ message: 'Student already in this batch' });
        }

        if (batch.students.length >= batch.capacity) {
            return res.status(400).json({ message: 'Batch is full' });
        }

        const user = await User.findById(studentId);
        if (!user) {
            return res.status(404).json({ message: 'Student not found' });
        }

        batch.students.push(studentId);
        await batch.save();

        user.batch = batch._id;
        // Initialize student attendance schedule based on batch session dates
        if (batch.sessionDates && batch.sessionDates.length > 0) {
            user.attendance = batch.sessionDates.map(d => ({
                date: new Date(d),
                status: 'unattended'
            }));
        }

        // Add batch's program to student's enrolledPrograms if not already present
        const progId = batch.program && batch.program._id ? batch.program._id : batch.program;
        if (progId) {
            if (!user.enrolledPrograms) {
                user.enrolledPrograms = [];
            }
            const hasProgram = user.enrolledPrograms.some(
                (p) => p.toString() === progId.toString()
            );
            if (!hasProgram) {
                user.enrolledPrograms.push(progId);
            }
        }
        await user.save();

        // Create Offline Order Record for this assignment
        const Order = require('../models/Order');
        const Program = require('../models/Program');
        
        let amount = 0;
        if (req.body.feeStatus === 'Paid') {
            const progId = batch.program && batch.program._id ? batch.program._id : batch.program;
            if (progId) {
                const programObj = await Program.findById(progId);
                if (programObj) {
                    amount = programObj.fees || 0;
                }
            }
        }

        const orderData = {
            user: studentId,
            studentId: user.studentId || `TEMP_${studentId}`,
            programId: (batch.program && batch.program._id ? batch.program._id : batch.program) || undefined,
            batchId: batch._id,
            amount: amount,
            feeStatus: req.body.feeStatus || 'Paid',
            paymentMode: req.body.paymentMode || 'Offline',
            paymentProof: req.body.paymentProof || '',
            comments: req.body.comments || '',
            status: 'success',
            fulfillmentStatus: 'Completed'
        };

        if (req.body.transactionId) {
            orderData.transactionId = req.body.transactionId;
        }

        const newOrder = new Order(orderData);
        await newOrder.save();
        
        // Notify student of assignment
        try {
            const { createNotification } = require('./notificationController');
            await createNotification({
                userId: studentId,
                role: 'student',
                title: 'Assigned to Batch',
                message: `You have been assigned to batch ${batch.name}.`,
                type: 'batch',
                link: '/dashboard'
            });
        } catch(err) { console.error('Notification error:', err); }

        res.json(batch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a batch
exports.updateBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);

        if (batch) {
            batch.name = req.body.name || batch.name;
            batch.level = req.body.level || batch.level;
            batch.days = req.body.days || batch.days;
            batch.time = req.body.time || batch.time;
            batch.coach = req.body.coach || batch.coach;
            batch.capacity = req.body.capacity || batch.capacity;
            batch.program = req.body.program || batch.program;
            batch.location = req.body.location !== undefined ? req.body.location : batch.location;
            batch.startDate = req.body.startDate !== undefined ? req.body.startDate : batch.startDate;
            batch.active = req.body.active !== undefined ? req.body.active : batch.active;

            const updatedBatch = await batch.save();
            res.json(updatedBatch);
        } else {
            res.status(404).json({ message: 'Batch not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a batch
exports.deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);

        if (batch) {
            await Batch.deleteOne({ _id: req.params.id });
            res.json({ message: 'Batch removed' });
        } else {
            res.status(404).json({ message: 'Batch not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove student from batch
exports.removeStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const batch = await Batch.findById(req.params.id);

        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        batch.students = batch.students.filter(id => id.toString() !== studentId);
        await batch.save();

        const user = await User.findById(studentId);
        if (user) {
            // Remove batch and schedule (attendance)
            user.batch = null;
            user.attendance = []; 
            
            // Also optionally remove from enrolledPrograms if they are tied to this batch
            if (batch.program) {
                const progId = batch.program._id ? batch.program._id.toString() : batch.program.toString();
                if (user.enrolledPrograms) {
                    user.enrolledPrograms = user.enrolledPrograms.filter(
                        (p) => p.toString() !== progId
                    );
                }
            }
            
            await user.save();
        }

        res.json(batch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get batches for a specific student
exports.getStudentBatches = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const batches = await Batch.find({ students: studentId })
            .populate('program', 'title level')
            .populate('coach', 'firstName lastName email mobile specialization bio experience rating');
        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
