const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin',"owner"], default: 'user' },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'blocked'], 
    default: 'active' 
  },
  statusReason: { type: String }, // Reason for status change
  phone: {
    type: String,
    required: true,
    unique:true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v); // Only allows 10 digits
      },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  planId: { type: mongoose.Types.ObjectId, ref: "Plan" },
planName: { type: String },
  paymentDone: { type: Boolean, default: false },
  paymentDoneOn: { type: Date },
  lastPaymentAmount: { type: Number },
  paymentMethod: { type: String },
  // Socket-related fields
  online_status: { 
    type: String, 
    enum: ["online", "offline"], 
    default: "offline" 
  },
  last_seen: { type: Date },
  // Push notification subscription
  subscription: {
    endpoint: { type: String },
    keys: {
      p256dh: { type: String },
      auth: { type: String }
    }
  },
  // Password reset fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel ; 