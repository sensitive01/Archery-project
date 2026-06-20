const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/stats', protect, admin, adminController.getDashboardStats);
router.get('/transactions', protect, admin, adminController.getAllTransactions);
router.get('/attendance', protect, admin, adminController.getAttendanceList);
router.post('/attendance', protect, admin, adminController.updateAttendance);
router.put('/orders/fulfillment', protect, admin, adminController.updateOrderFulfillment);

module.exports = router;

