const User = require('../models/User');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .populate('enrolledPrograms', 'title')
            .select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('enrolledPrograms')
            .populate({
                path: 'batch',
                populate: { path: 'program', select: 'title totalClasses schedule' },
                select: 'name days startDate sessionDates time location program'
            })
            .select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user details
exports.updateUser = async (req, res) => {
    try {
        const allowedUpdates = [
            'firstName', 'lastName', 'mobile', 'status', 'guardianName',
            'dob', 'age', 'gender', 'bloodGroup', 'aadhaar',
            'category', 'institutionName', 'institutionDesignation',
            'guardianContact', 'address',
            'medicalConditions', 'emergencyContactName', 'emergencyContactNumber',
            'preferredBatch', 'previousExperience', 'previousExperienceDetails',
            'profilePic'
        ];

        const updates = Object.keys(req.body);
        // CHANGED: Instead of strictly failing if extra fields are present, we will ignore them.
        // This is necessary because frontend might send the whole user object which includes _id, role, etc.

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        updates.forEach((update) => {
            if (allowedUpdates.includes(update)) {
                user[update] = req.body[update];
            }
        });

        await user.save();

        // Re-fetch to populate refs before returning
        const updatedUser = await User.findById(user._id)
            .populate('enrolledPrograms')
            .populate({
                path: 'batch',
                populate: { path: 'program', select: 'title totalClasses schedule' },
                select: 'name days startDate sessionDates time location program'
            })
            .select('-password');

        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Toggle Block Status
exports.toggleBlockStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = user.status === 'active' ? 'blocked' : 'active';
        await user.save();

        res.json({ message: `User ${user.status === 'active' ? 'unblocked' : 'blocked'} successfully`, status: user.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get all coaches
exports.getAllCoaches = async (req, res) => {
    try {
        const coaches = await User.find({ role: 'coach' }).select('-password');
        res.json(coaches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new coach
exports.createCoach = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, experience, specialization, password, profilePic, bio } = req.body;

        // Basic validation
        if (!email || !firstName || !lastName) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'password123', salt);

        const newCoach = new User({
            firstName,
            lastName,
            email,
            mobile,
            experience: experience || 0,
            specialization: specialization ? (Array.isArray(specialization) ? specialization : [specialization]) : [], // Store as array
            role: 'coach',
            password: hashedPassword,
            profilePic: profilePic || "",
            bio: bio || "",
            status: 'active'
        });

        await newCoach.save();
        res.status(201).json(newCoach);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update coach details
exports.updateCoach = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, experience, specialization, password, profilePic, bio } = req.body;

        const coach = await User.findById(req.params.id);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({ message: 'Coach not found' });
        }

        if (email && email !== coach.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            coach.email = email;
        }

        if (firstName) coach.firstName = firstName;
        if (lastName) coach.lastName = lastName;
        if (mobile !== undefined) coach.mobile = mobile;
        if (experience !== undefined) coach.experience = experience;
        if (specialization !== undefined) {
            coach.specialization = Array.isArray(specialization) ? specialization : [specialization];
        }
        if (profilePic !== undefined) coach.profilePic = profilePic;
        if (bio !== undefined) coach.bio = bio;

        if (password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            coach.password = await bcrypt.hash(password, salt);
        }

        await coach.save();
        res.json(coach);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete coach
exports.deleteCoach = async (req, res) => {
    try {
        const coach = await User.findById(req.params.id);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({ message: 'Coach not found' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coach deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete student/member
exports.deleteStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Remove student reference from any batches
        const Batch = require('../models/Batch');
        await Batch.updateMany(
            { students: req.params.id },
            { $pull: { students: req.params.id } }
        );

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

