const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
};

const verifyOTP = async (enteredOTP, hashedOTP) => {
  return await bcrypt.compare(enteredOTP, hashedOTP);
};

const isOTPExpired = (otpExpiry) => {
  return new Date() > new Date(otpExpiry);
};

const canResendOTP = (otpLastSent) => {
  if (!otpLastSent) return true;
  const cooldown = 60 * 1000; // 60 seconds
  return (Date.now() - new Date(otpLastSent).getTime()) > cooldown;
};

const resendCooldownSeconds = (otpLastSent) => {
  if (!otpLastSent) return 0;
  const elapsed = (Date.now() - new Date(otpLastSent).getTime()) / 1000;
  return Math.max(0, Math.ceil(60 - elapsed));
};

module.exports = { generateOTP, hashOTP, verifyOTP, isOTPExpired, canResendOTP, resendCooldownSeconds };
