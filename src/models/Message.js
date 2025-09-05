const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  _id: {
    type: String
  },
  type: {
    type: String
  },
  conversationId: {
    type: mongoose.Schema.Types.Mixed,  // ObjectId (group) or String (1on1)
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
    default: '',
  },
  messageType: { 
    type: String,
    enum: ['text', 'visitor', 'checkin', 'checkout', 'task', 'note', 'file', 'splitMoney'],
    default: 'text'
  },
  fileUrl: { type: String },
  appType: {
    type: String,
    enum: ['hostel', 'shop', 'service'],
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  seenBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
    }
  ],
  deliveredTo: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
    }
  ],
  status: {
    type: String,
    default: 'saved',
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

const MessageModel = mongoose.model('Message', MessageSchema);

module.exports = MessageModel;
