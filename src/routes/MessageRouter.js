const express = require('express');
const router = express.Router();
const authentication = require('../middleware/authentication');
const {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  markMessageAsRead,
  editMessage,
  deleteMessage,
  getUnreadMessageCount,
  getConversationUnreadCount
} = require('../controllers/MessageController');

// Apply authentication middleware to all routes
router.use(authentication);

// Send a message to a conversation
router.post('/', sendMessage);

// Get messages from a conversation with pagination
router.get('/conversation/:conversationId', getMessages);

// Mark all messages in a conversation as read
router.put('/conversation/:conversationId/read', markMessagesAsRead);

// Mark a specific message as read
router.put('/:messageId/read', markMessageAsRead);

// Edit a message
router.put('/:messageId', editMessage);

// Delete a message
router.delete('/:messageId', deleteMessage);

// Get unread message count for all conversations
router.get('/unread/count', getUnreadMessageCount);

// Get unread message count for a specific conversation
router.get('/unread/count/:conversationId', getConversationUnreadCount);

module.exports = router;
