const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, purchaseProduct, getMyPurchases } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/purchase-product', purchaseProduct);
router.get('/my-purchases', protect, getMyPurchases);

module.exports = router;
