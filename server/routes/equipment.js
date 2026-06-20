const express = require('express');
const router = express.Router();
const { getEquipment, createEquipment, updateEquipment, deleteEquipment } = require('../controllers/equipmentController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getEquipment);
router.post('/', protect, admin, createEquipment);
router.put('/:id', protect, admin, updateEquipment);
router.delete('/:id', protect, admin, deleteEquipment);

module.exports = router;
