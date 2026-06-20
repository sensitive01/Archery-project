const Gallery = require('../models/Gallery');

exports.getActiveGallery = async (req, res) => {
    try {
        const items = await Gallery.find({ active: true }).sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getAllGallery = async (req, res) => {
    try {
        const items = await Gallery.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.createGalleryItem = async (req, res) => {
    try {
        const { image, title, description, active } = req.body;
        const newItem = new Gallery({ image, title, description, active });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateGalleryItem = async (req, res) => {
    try {
        const { image, title, description, active } = req.body;
        const item = await Gallery.findByIdAndUpdate(
            req.params.id,
            { image, title, description, active },
            { new: true }
        );
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteGalleryItem = async (req, res) => {
    try {
        const item = await Gallery.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
