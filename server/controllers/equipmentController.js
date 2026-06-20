const Equipment = require('../models/Equipment');

// Get all equipment
exports.getEquipment = async (req, res) => {
    try {
        const filter = req.query.all === 'true' ? {} : { active: true };
        const equipment = await Equipment.find(filter);
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new equipment
exports.createEquipment = async (req, res) => {
    try {
        const { itemCode, name, description, images, price, qty, availableQty, category, subCategory, specifications, active } = req.body;
        const equipment = await Equipment.create({
            itemCode,
            name,
            description,
            images: Array.isArray(images) ? images : [],
            price: Number(price),
            qty: Number(qty),
            availableQty: availableQty !== undefined && availableQty !== '' ? Number(availableQty) : Number(qty),
            category: category || "Uncategorized",
            subCategory: subCategory || "",
            specifications: Array.isArray(specifications) ? specifications : [],
            active: active !== undefined ? active : true
        });
        res.status(201).json(equipment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an equipment
exports.updateEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (equipment) {
            equipment.itemCode = req.body.itemCode !== undefined ? req.body.itemCode : equipment.itemCode;
            equipment.name = req.body.name || equipment.name;
            equipment.description = req.body.description !== undefined ? req.body.description : equipment.description;
            equipment.images = req.body.images !== undefined ? req.body.images : equipment.images;
            equipment.qty = req.body.qty !== undefined ? Number(req.body.qty) : equipment.qty;
            equipment.availableQty = req.body.availableQty !== undefined ? Number(req.body.availableQty) : equipment.availableQty;
            equipment.price = req.body.price !== undefined ? Number(req.body.price) : equipment.price;
            equipment.category = req.body.category !== undefined ? req.body.category : equipment.category;
            equipment.subCategory = req.body.subCategory !== undefined ? req.body.subCategory : equipment.subCategory;
            equipment.specifications = req.body.specifications !== undefined ? req.body.specifications : equipment.specifications;
            equipment.active = req.body.active !== undefined ? req.body.active : equipment.active;
            
            const updated = await equipment.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Equipment not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete/Deactivate an equipment
exports.deleteEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (equipment) {
            await Equipment.deleteOne({ _id: req.params.id });
            res.json({ message: 'Equipment removed' });
        } else {
            res.status(404).json({ message: 'Equipment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
