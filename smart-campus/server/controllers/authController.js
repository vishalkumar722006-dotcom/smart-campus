const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, hashOTP, verifyOTP, isOTPExpired, canResendOTP, resendCooldownSeconds } = require('../services/otpService');
const { sendVerificationOTP, sendAdminOTP, sendPasswordResetOTP } = require('../services/emailService');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, userId, phone, department, role } = req.body;
    if (!name || !email || !password || !userId) return res.status(400).json({ success: false, message: 'Please provide name, email, password, and ID.' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    if (!/[A-Z]/.test(password)) return res.status(400).json({ success: false, message: 'Password must include at least one uppercase letter.' });
    if (!/[a-z]/.test(password)) return res.status(400).json({ success: false, message: 'Password must include at least one lowercase letter.' });
    if (!/[0-9]/.test(password)) return res.status(400).json({ success: false, message: 'Password must include at least one number.' });
    if (role === 'admin') return res.status(403).json({ success: false, message: 'Cannot register as admin.' });

    const existing = await User.findOne({ $or: [{ email }, { userId }] });
    if (existing) {
      if (existing.email === email.toLowerCase()) return res.status(400).json({ success: false, message: 'This email is already registered.' });
      return res.status(400).json({ success: false, message: 'This Student/Faculty ID is already taken.' });
    }

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const user = await User.create({ name, email, password, userId, phone, department, role: role || 'student', isVerified: false, otp: hashedOtp, otpExpiry, otpType: 'verify', otpLastSent: new Date() });

    await sendVerificationOTP(email, name, otp);

    res.status(201).json({ success: true, message: 'Account created. Please verify your email with the OTP sent.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/verify-otp
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required.' });

    const user = await User.findOne({ email }).select('+otp +otpExpiry +otpAttempts +otpType');
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified. Please login.' });
    if (user.otpType !== 'verify') return res.status(400).json({ success: false, message: 'Invalid OTP request.' });
    if (user.otpAttempts >= 5) return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    if (!user.otp || !user.otpExpiry) return res.status(400).json({ success: false, message: 'No OTP found. Please register again.' });
    if (isOTPExpired(user.otpExpiry)) return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

    const isMatch = await verifyOTP(otp, user.otp);
    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.` });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    user.otpType = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified successfully! You can now login.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry +otpAttempts +otpType +otpLastSent');
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });

    if (!canResendOTP(user.otpLastSent)) {
      const secs = resendCooldownSeconds(user.otpLastSent);
      return res.status(429).json({ success: false, message: `Please wait ${secs} seconds before requesting a new OTP.`, cooldown: secs });
    }

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    user.otp = hashedOtp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpType = type || 'verify';
    user.otpLastSent = new Date();
    await user.save({ validateBeforeSave: false });

    if (type === 'admin') await sendAdminOTP(process.env.EMAIL_USER, user.name, otp);
    else if (type === 'reset') await sendPasswordResetOTP(email, user.name, otp);
    else await sendVerificationOTP(email, user.name, otp);

    res.json({ success: true, message: 'New OTP sent to your email.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password.' });

    const user = await User.findOne({ email }).select('+password +otp +otpExpiry +otpLastSent');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    if (user.status === 'inactive') return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email before logging in.', requireVerification: true, email: user.email });
    }

    if (user.role === 'admin') {
      if (!canResendOTP(user.otpLastSent)) {
        return res.json({ success: true, requireOTP: true, email: user.email, message: 'OTP already sent. Please check your email.' });
      }
      const otp = generateOTP();
      const hashedOtp = await hashOTP(otp);
      user.otp = hashedOtp;
      user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      user.otpAttempts = 0;
      user.otpType = 'admin';
      user.otpLastSent = new Date();
      await user.save({ validateBeforeSave: false });
      //await sendAdminOTP(process.env.EMAIL_USER, user.name, otp);
      await sendAdminOTP(process.env.EMAIL_USER, user.name, otp);
      return res.json({ success: true, requireOTP: true, email: user.email, message: 'OTP sent to your admin email.' });
    }

    const token = signToken(user._id);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, userId: user.userId, department: user.department, isVerified: user.isVerified } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/admin-verify-otp
exports.adminVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, role: 'admin' }).select('+otp +otpExpiry +otpAttempts +otpType');
    if (!user) return res.status(404).json({ success: false, message: 'Admin account not found.' });
    if (user.otpType !== 'admin') return res.status(400).json({ success: false, message: 'Invalid OTP request.' });
    if (user.otpAttempts >= 5) return res.status(429).json({ success: false, message: 'Too many attempts. Please login again.' });
    if (!user.otp || isOTPExpired(user.otpExpiry)) return res.status(400).json({ success: false, message: 'OTP has expired. Please login again.' });

    const isMatch = await verifyOTP(otp, user.otp);
    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.` });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    user.otpType = undefined;
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, userId: user.userId, isVerified: user.isVerified } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otpLastSent');
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });

    if (!canResendOTP(user.otpLastSent)) {
      const secs = resendCooldownSeconds(user.otpLastSent);
      return res.status(429).json({ success: false, message: `Please wait ${secs} seconds before requesting again.`, cooldown: secs });
    }

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    user.otp = hashedOtp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpType = 'reset';
    user.otpLastSent = new Date();
    user.passwordResetVerified = false;
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetOTP(email, user.name, otp);
    res.json({ success: true, message: 'Password reset OTP sent to your email.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/verify-reset-otp
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry +otpAttempts +otpType +passwordResetVerified');
    if (!user) return res.status(404).json({ success: false, message: 'No account found.' });
    if (user.otpType !== 'reset') return res.status(400).json({ success: false, message: 'Invalid OTP request.' });
    if (user.otpAttempts >= 5) return res.status(429).json({ success: false, message: 'Too many attempts. Please try again.' });
    if (!user.otp || isOTPExpired(user.otpExpiry)) return res.status(400).json({ success: false, message: 'OTP has expired.' });

    const isMatch = await verifyOTP(otp, user.otp);
    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.` });
    }

    user.passwordResetVerified = true;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'OTP verified. You can now reset your password.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordResetVerified +otpType');
    if (!user) return res.status(404).json({ success: false, message: 'No account found.' });
    if (!user.passwordResetVerified) return res.status(400).json({ success: false, message: 'Please verify OTP first.' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    user.password = password;
    user.passwordResetVerified = false;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpType = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};

// PUT /api/auth/update-me
exports.updateMe = async (req, res) => {
  try {
    const { name, phone, department } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, department }, { new: true, runValidators: true });
    res.json({ success: true, user, message: 'Profile updated successfully.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};
