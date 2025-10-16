const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['business_approval', 'business_rejection', 'business_submission', 'product_approval', 'product_rejection', 'product_submission', 'enquiry_received', 'enquiry_response', 'general'], 
    required: true 
  },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  data: { type: mongoose.Schema.Types.Mixed } // Additional data for the notification
});

const NotificationModel = mongoose.model('Notification', notificationSchema);
module.exports = NotificationModel;
