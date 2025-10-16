const express = require('express');
const { 
  generateAndSendOTP, 
  verifyOTP, 
  resendOTP, 
  checkOTPStatus 
} = require('../controllers/OTPController');

const otpRouter = express.Router();

// Generate and send OTP
otpRouter.post('/generate', generateAndSendOTP);

// Verify OTP
otpRouter.post('/verify', verifyOTP);

// Resend OTP
otpRouter.post('/resend', resendOTP);

// Check OTP status
otpRouter.get('/status', checkOTPStatus);

module.exports = otpRouter;
