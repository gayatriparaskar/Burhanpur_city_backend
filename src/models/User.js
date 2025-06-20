const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin',"owner"], default: 'user' },
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
paymentMethod: { type: String }
});

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel ; 