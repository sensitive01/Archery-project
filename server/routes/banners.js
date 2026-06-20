const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { protect, admin } = require('../middlewares/authMiddleware');

// @route   POST /api/banners
// @desc    Create a new banner
// @access  Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { imageUrl, title, description, position, placement, fromDate, expiryDate } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        const newBanner = new Banner({
            imageUrl,
            title,
            description,
            position,
            placement,
            fromDate: fromDate || undefined,
            expiryDate: expiryDate || undefined
        });

        const savedBanner = await newBanner.save();
        res.status(201).json(savedBanner);
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/banners
// @desc    Get all banners
// @access  Public
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/banners/active
// @desc    Get active and non-expired banners
// @access  Public
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const banners = await Banner.find({
            isActive: true,
            $and: [
                {
                    $or: [
                        { fromDate: { $lte: now } },
                        { fromDate: null },
                        { fromDate: { $exists: false } }
                    ]
                },
                {
                    $or: [
                        { expiryDate: { $gt: now } },
                        { expiryDate: null },
                        { expiryDate: { $exists: false } }
                    ]
                }
            ]
        }).sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        console.error('Error fetching active banners:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/banners/:id
// @desc    Update a banner
// @access  Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { imageUrl, title, description, position, placement, fromDate, expiryDate, isActive } = req.body;

        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        if (imageUrl) banner.imageUrl = imageUrl;
        if (title !== undefined) banner.title = title;
        if (description !== undefined) banner.description = description;
        if (position !== undefined) banner.position = position;
        if (placement !== undefined) banner.placement = placement;
        if (fromDate !== undefined) banner.fromDate = fromDate || undefined;
        if (expiryDate !== undefined) banner.expiryDate = expiryDate || undefined;
        if (isActive !== undefined) banner.isActive = isActive;

        const updatedBanner = await banner.save();
        res.json(updatedBanner);
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/banners/:id
// @desc    Delete a banner
// @access  Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
