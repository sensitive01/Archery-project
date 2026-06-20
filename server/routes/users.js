const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Routes
router.get('/students', protect, admin, userController.getAllStudents);
router.get('/coaches', protect, admin, userController.getAllCoaches);
router.post('/coaches', protect, admin, userController.createCoach);
router.put('/coaches/:id', protect, admin, userController.updateCoach);
router.delete('/coaches/:id', protect, admin, userController.deleteCoach);
router.get('/:id', protect, userController.getUserById);
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, admin, userController.deleteStudent);
router.patch('/:id/toggle-block', protect, admin, userController.toggleBlockStatus);

module.exports = router;
