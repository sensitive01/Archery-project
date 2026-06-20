const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', galleryController.getActiveGallery);
router.get('/all', protect, admin, galleryController.getAllGallery);
router.post('/', protect, admin, galleryController.createGalleryItem);
router.put('/:id', protect, admin, galleryController.updateGalleryItem);
router.delete('/:id', protect, admin, galleryController.deleteGalleryItem);

module.exports = router;
