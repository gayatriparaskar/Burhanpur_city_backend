const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory',required :true },
  description: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  images: String,
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    review: String,
    date: { type: Date, default: Date.now }
  }],
  specility:{type:String},
  block:{type:String},
  features:[String],
  keyWords:[String],
 lead: [
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    email: String,
    phone_number: String,
    isActive: Boolean
  }
],
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'blocked'], 
    default: 'inactive' 
  },
  statusReason: { type: String }, // Reason for status change
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  submittedAt: { type: Date, default: Date.now },
  // new 
  revenue: { type: Number, default: 0 },
  activeLeads: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const BussinessModel= mongoose.model('Business', businessSchema);

module.exports = BussinessModel ;