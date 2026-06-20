const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', protect, admin, batchController.createBatch);
router.get('/', batchController.getAllBatches);
router.get('/student/:studentId', protect, batchController.getStudentBatches);
router.post('/:id/assign', protect, admin, batchController.assignStudent);
router.post('/:id/remove', protect, admin, batchController.removeStudent);
router.route('/:id')
    .put(protect, admin, batchController.updateBatch)
    .delete(protect, admin, batchController.deleteBatch);

module.exports = router;
