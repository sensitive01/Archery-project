const express = require('express');
const router = express.Router();
const { registerStudent, login, sendOtp, verifyOtp, resetPassword, forgotPasswordReset } = require('../controllers/authController');

router.post('/register', registerStudent);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/forgot-password-reset', forgotPasswordReset);

module.exports = router;
