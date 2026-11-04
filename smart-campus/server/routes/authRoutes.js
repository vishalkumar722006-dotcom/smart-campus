const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, verifyEmailOTP, resendOTP, login, adminVerifyOTP, forgotPassword, verifyResetOTP, resetPassword, getMe, updateMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' } });
const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: 'Too many OTP requests. Please try again later.' } });

router.post('/register', authLimiter, register);
router.post('/verify-otp', otpLimiter, verifyEmailOTP);
router.post('/resend-otp', otpLimiter, resendOTP);
router.post('/login', authLimiter, login);
router.post('/admin-verify-otp', otpLimiter, adminVerifyOTP);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-reset-otp', otpLimiter, verifyResetOTP);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/update-me', protect, updateMe);
router.post('/logout', logout);

module.exports = router;
