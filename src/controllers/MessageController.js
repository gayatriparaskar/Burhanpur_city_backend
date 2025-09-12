const MessageModel = require('../models/Message');
const ConversationGroup = require('../models/conversation');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../helper/successAndError');

// Send a message to a conversation
const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      message,
      messageType = 'text',
      fileUrl,
      payload = {}
    } = req.body;
    const senderId = req.userId;

    if (!conversationId || !message) {
      return res.status(400).json(errorResponse(400, 'Conversation ID and message are required'));
    }

    // Check if conversation exists and user is a member
    const conversation = await ConversationGroup.findOne({
      _id: conversationId,
      members: { $elemMatch: { _id: senderId } },
      status: 'active'
    });

    if (!conversation) {
      return res.status(404).json(errorResponse(404, 'Conversation not found or you are not a member'));
    }

    // Determine receiver ID based on conversation type
    let receiverId = null;
    if (conversation.type === '1on1') {
      receiverId = conversation.members.find(
        member => member._id.toString() !== senderId.toString()
      )?._id;
    }

    // Create the message
    const messageData = {
      conversationId,
      senderId,
      receiverId,
      message,
      messageType,
      fileUrl,
      payload,
      timestamp: new Date(),
      read: false,
      status: 'saved'
    };

    const savedMessage = await MessageModel.create(messageData);

    // Update conversation's last message
    await ConversationGroup.findByIdAndUpdate(conversationId, {
      lastMessage: savedMessage._id,
      lastMessageAt: new Date()
    });

    // Populate sender details
    await savedMessage.populate('senderId', 'name email profilePicture');

    return res.status(201).json(successResponse(201, 'Message sent successfully', savedMessage));
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Get messages from a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.userId;

    // Check if conversation exists and user is a member
    const conversation = await ConversationGroup.findOne({
      _id: conversationId,
      members: { $elemMatch: { _id: userId } },
      status: 'active'
    });

    if (!conversation) {
      return res.status(404).json(errorResponse(404, 'Conversation not found or you are not a member'));
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get messages with pagination
    const messages = await MessageModel.find({
      conversationId,
      deleted: false
    })
    .populate('senderId', 'name email profilePicture')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Get total count for pagination info
    const totalMessages = await MessageModel.countDocuments({
      conversationId,
      deleted: false
    });

    const totalPages = Math.ceil(totalMessages / parseInt(limit));

    return res.status(200).json(successResponse(200, 'Messages retrieved successfully', {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalMessages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    // Check if conversation exists and user is a member
    const conversation = await ConversationGroup.findOne({
      _id: conversationId,
      members: { $elemMatch: { _id: userId } },
      status: 'active'
    });

    if (!conversation) {
      return res.status(404).json(errorResponse(404, 'Conversation not found or you are not a member'));
    }

    // Mark all unread messages as read
    const result = await MessageModel.updateMany(
      {
        conversationId,
        senderId: { $ne: userId }, // Don't mark own messages as read
        read: false
      },
      {
        read: true,
        $push: {
          seenBy: {
            userId: userId,
            timestamp: new Date()
          }
        }
      }
    );

    return res.status(200).json(successResponse(200, 'Messages marked as read', {
      modifiedCount: result.modifiedCount
    }));
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Mark a specific message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await MessageModel.findById(messageId);

    if (!message) {
      return res.status(404).json(errorResponse(404, 'Message not found'));
    }

    // Check if user is a member of the conversation
    const conversation = await ConversationGroup.findOne({
      _id: message.conversationId,
      members: { $elemMatch: { _id: userId } },
      status: 'active'
    });

    if (!conversation) {
      return res.status(404).json(errorResponse(404, 'Conversation not found or you are not a member'));
    }

    // Don't mark own messages as read
    if (message.senderId.toString() === userId.toString()) {
      return res.status(400).json(errorResponse(400, 'Cannot mark your own message as read'));
    }

    // Update message
    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      {
        read: true,
        $push: {
          seenBy: {
            userId: userId,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    ).populate('senderId', 'name email profilePicture');

    return res.status(200).json(successResponse(200, 'Message marked as read', updatedMessage));
  } catch (error) {
    console.error('Error marking message as read:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Edit a message
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json(errorResponse(400, 'Message content is required'));
    }

    const existingMessage = await MessageModel.findById(messageId);

    if (!existingMessage) {
      return res.status(404).json(errorResponse(404, 'Message not found'));
    }

    // Check if user is the sender
    if (existingMessage.senderId.toString() !== userId.toString()) {
      return res.status(403).json(errorResponse(403, 'You can only edit your own messages'));
    }

    // Update message
    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      {
        message,
        edited: true,
        editedAt: new Date()
      },
      { new: true }
    ).populate('senderId', 'name email profilePicture');

    return res.status(200).json(successResponse(200, 'Message updated successfully', updatedMessage));
  } catch (error) {
    console.error('Error editing message:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const existingMessage = await MessageModel.findById(messageId);

    if (!existingMessage) {
      return res.status(404).json(errorResponse(404, 'Message not found'));
    }

    // Check if user is the sender
    if (existingMessage.senderId.toString() !== userId.toString()) {
      return res.status(403).json(errorResponse(403, 'You can only delete your own messages'));
    }

    // Soft delete the message
    const deletedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      {
        deleted: true,
        deletedBy: userId,
        deletedAt: new Date()
      },
      { new: true }
    );

    return res.status(200).json(successResponse(200, 'Message deleted successfully', deletedMessage));
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Get unread message count for a user
const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all conversations where user is a member
    const conversations = await ConversationGroup.find({
      members: { $elemMatch: { _id: userId } },
      status: 'active'
    }).select('_id');

    const conversationIds = conversations.map(conv => conv._id);

    // Count unread messages
    const unreadCount = await MessageModel.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: userId },
      read: false,
      deleted: false
    });

    return res.status(200).json(successResponse(200, 'Unread count retrieved', { unreadCount }));
  } catch (error) {
    console.error('Error getting unread count:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Get unread message count for a specific conversation
const getConversationUnreadCount = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    // Check if conversation exists and user is a member
    const conversation = await ConversationGroup.findOne({
      _id: conversationId,
      members: { $elemMatch: { _id: userId } },
      status: 'active'
    });

    if (!conversation) {
      return res.status(404).json(errorResponse(404, 'Conversation not found or you are not a member'));
    }

    // Count unread messages in this conversation
    const unreadCount = await MessageModel.countDocuments({
      conversationId,
      senderId: { $ne: userId },
      read: false,
      deleted: false
    });

    return res.status(200).json(successResponse(200, 'Unread count retrieved', { unreadCount }));
  } catch (error) {
    console.error('Error getting conversation unread count:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  markMessageAsRead,
  editMessage,
  deleteMessage,
  getUnreadMessageCount,
  getConversationUnreadCount
};
