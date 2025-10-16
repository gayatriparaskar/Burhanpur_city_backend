const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v); // Only allows 10 digits
      },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  otp: {
    type: String,
    required: true
  },
  hashedOtp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['business_registration', 'phone_verification', 'password_reset'],
    default: 'business_registration'
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3 // Maximum 3 attempts
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date
  }
});

// Index for efficient queries
otpSchema.index({ phone: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to check if max attempts reached
otpSchema.methods.hasMaxAttempts = function() {
  return this.attempts >= 3;
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Method to mark as verified
otpSchema.methods.markAsVerified = function() {
  this.isVerified = true;
  this.verifiedAt = new Date();
  return this.save();
};

const OTPModel = mongoose.model('OTP', otpSchema);

module.exports = OTPModel;
