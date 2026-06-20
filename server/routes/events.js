const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', eventController.getEvents);
router.post('/', protect, admin, eventController.createEvent);
router.put('/:id', protect, admin, eventController.updateEvent);
router.delete('/:id', protect, admin, eventController.deleteEvent);
router.post('/:id/enroll', eventController.enrollInEvent);
router.delete('/:id/enroll/:enrollmentId', protect, admin, eventController.removeEnrollment);

module.exports = router;
