const Program = require('../models/Program');

// @desc    Get all programs
// @route   GET /api/programs
// @access  Public
exports.getPrograms = async (req, res) => {
    try {
        const query = req.query.all === 'true' ? {} : { active: true };
        const programs = await Program.find(query);
        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new program
// @route   POST /api/programs
// @access  Private/Admin
exports.createProgram = async (req, res) => {
    try {
        const { title, level, description, duration, totalClasses, sessionDuration, fees, image, active, ageGroup, schedule, equipment, features, kits } = req.body;

        const program = await Program.create({
            title,
            level,
            description,
            duration,
            totalClasses,
            fees,
            image,
            ageGroup,
            schedule,
            sessionDuration,
            equipment,
            features,
            kits: Array.isArray(kits) ? kits.map(k => ({
                name: k.name,
                qty: k.qty ? Number(k.qty) : undefined,
                price: k.price ? Number(k.price) : undefined
            })) : [],
            active: active !== undefined ? active : true
        });

        res.status(201).json(program);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a program
// @route   PUT /api/programs/:id
// @access  Private/Admin
exports.updateProgram = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);

        if (program) {
            program.title = req.body.title || program.title;
            program.level = req.body.level || program.level;
            program.description = req.body.description || program.description;
            program.duration = req.body.duration || program.duration;
            program.totalClasses = req.body.totalClasses || program.totalClasses;
            program.fees = req.body.fees || program.fees;
            program.image = req.body.image || program.image;
            program.ageGroup = req.body.ageGroup || program.ageGroup;
            program.schedule = req.body.schedule || program.schedule;
            program.sessionDuration = req.body.sessionDuration || program.sessionDuration;
            program.equipment = req.body.equipment || program.equipment;
            program.features = req.body.features || program.features;
            program.kits = req.body.kits !== undefined ? (Array.isArray(req.body.kits) ? req.body.kits.map(k => ({
                name: k.name,
                qty: k.qty ? Number(k.qty) : undefined,
                price: k.price ? Number(k.price) : undefined
            })) : []) : program.kits;
            program.active = req.body.active !== undefined ? req.body.active : program.active;

            const updatedProgram = await program.save();
            res.json(updatedProgram);
        } else {
            res.status(404).json({ message: 'Program not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a program
// @route   DELETE /api/programs/:id
// @access  Private/Admin
exports.deleteProgram = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);

        if (program) {
            await Program.deleteOne({ _id: req.params.id });
            res.json({ message: 'Program removed' });
        } else {
            res.status(404).json({ message: 'Program not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
