const express = require('express');
const router = express.Router();
const authentication = require('../middleware/authentication');
const {
  createOneOnOneConversation,
  createGroupConversation,
  getUserConversations,
  getConversationById,
  addMembersToGroup,
  removeMembersFromGroup,
  updateGroupConversation,
  leaveConversation
} = require('../controllers/ConversationController');

// Apply authentication middleware to all routes
router.use(authentication);

// Create a 1-on-1 conversation
router.post('/1on1', createOneOnOneConversation);

// Create a group conversation
router.post('/group', createGroupConversation);

// Get all conversations for the authenticated user
router.get('/', getUserConversations);

// Get a specific conversation by ID
router.get('/:conversationId', getConversationById);

// Add members to a group conversation
router.post('/:conversationId/members', addMembersToGroup);

// Remove members from a group conversation
router.delete('/:conversationId/members', removeMembersFromGroup);

// Update group conversation details
router.put('/:conversationId', updateGroupConversation);

// Leave a conversation
router.delete('/:conversationId/leave', leaveConversation);

module.exports = router;
