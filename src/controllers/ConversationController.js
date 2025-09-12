const ConversationGroup = require('../models/conversation');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../helper/successAndError');

// Create a 1-on-1 conversation
const createOneOnOneConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.userId;

    if (!receiverId) {
      return res.status(400).json(errorResponse(400, 'Receiver ID is required'));
    }

    if (senderId === receiverId) {
      return res.status(400).json(errorResponse(400, 'Cannot create conversation with yourself'));
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json(errorResponse(404, 'Receiver not found'));
    }

    // Check if conversation already exists between these two users
    const existingConversation = await ConversationGroup.findOne({
      type: '1on1',
      members: {
        $all: [
          { $elemMatch: { _id: senderId } },
          { $elemMatch: { _id: receiverId } }
        ]
      }
    });

    if (existingConversation) {
      return res.status(200).json(successResponse(200, 'Conversation already exists', existingConversation));
    }

    // Create new 1-on-1 conversation
    const conversation = new ConversationGroup({
      type: '1on1',
      members: [
        { _id: senderId },
        { _id: receiverId }
      ],
      createdBy: senderId,
      status: 'active'
    });

    await conversation.save();

    // Populate the conversation with user details
    await conversation.populate('members._id', 'name email profilePicture');

    return res.status(201).json(successResponse(201, '1-on-1 conversation created successfully', conversation));
  } catch (error) {
    console.error('Error creating 1-on-1 conversation:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Create a group conversation
const createGroupConversation = async (req, res) => {
  try {
    const { name, members } = req.body;
    const createdBy = req.userId;

    if (!name || !members || !Array.isArray(members) || members.length < 1) {
      return res.status(400).json(errorResponse(400, 'Group name and at least 1 members are required'));
    }

    // Add creator to members if not already included
    if (!members.includes(createdBy)) {
      members.push(createdBy);
    }

    // Check if all members exist
    const existingUsers = await User.find({ _id: { $in: members } });
    if (existingUsers.length !== members.length) {
      return res.status(400).json(errorResponse(400, 'One or more members not found'));
    }

    // Create new group conversation
    const conversation = new ConversationGroup({
      name,
      type: 'group',
      members: members.map(memberId => ({ _id: memberId })),
      createdBy,
      status: 'active'
    });

    await conversation.save();

    // Populate the conversation with user details
    await conversation.populate('members._id', 'name email profilePicture');

    return res.status(201).json(successResponse(201, 'Group conversation created successfully', conversation));
  } catch (error) {
    console.error('Error creating group conversation:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Get all conversations for a user
const getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await ConversationGroup.find({
      members: { $elemMatch: { _id: userId } },
      status: 'active'
    })
    .populate('members._id', 'name email profilePicture')
    .populate('lastMessage')
    .populate('createdBy', 'name email')
    .sort({ lastMessageAt: -1, updatedAt: -1 });

    return res.status(200).json(successResponse(200, 'Conversations retrieved successfully', conversations));
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Get a specific conversation by ID
const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await ConversationGroup.findOne({
      _id: conversationId,
      members: { $elemMatch: { _id: userId } },
      status: 'active'
    })
    .populate('members._id', 'name email profilePicture')
    .populate('lastMessage')
    .populate('createdBy', 'name email');

    if (!conversation) {
      return res.status(404).json(errorResponse(404, 'Conversation not found'));
    }

    return res.status(200).json(successResponse(200, 'Conversation retrieved successfully', conversation));
  } catch (error) {
    console.error('Error getting conversation:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Add members to a group conversation
const addMembersToGroup = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { members } = req.body;
    const userId = req.userId;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json(errorResponse(400, 'Members array is required'));
    }

    const conversation = await ConversationGroup.findOne({
      _id: conversationId,
      type: 'group',
      members: { $elemMatch: { _id: userId } },
      status: 'active'
    });

    if (!conversation) {
      return res.status(404).json(errorResponse(404, 'Group conversation not found or you are not a member'));
    }

    // Check if all new members exist
    const existingUsers = await User.find({ _id: { $in: members } });
    if (existingUsers.length !== members.length) {
      return res.status(400).json(errorResponse(400, 'One or more members not found'));
    }

    // Add new members (avoid duplicates)
    const existingMemberIds = conversation.members.map(member => member._id.toString());
    const newMembers = members
      .filter(memberId => !existingMemberIds.includes(memberId.toString()))
      .map(memberId => ({ _id: memberId }));

    conversation.members.push(...newMembers);
    await conversation.save();

    // Populate the updated conversation
    await conversation.populate('members._id', 'name email profilePicture');

    return res.status(200).json(successResponse(200, 'Members added successfully', conversation));
  } catch (error) {
    console.error('Error adding members to group:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Remove members from a group conversation
const removeMembersFromGroup = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { members } = req.body;
    const userId = req.userId;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json(errorResponse(400, 'Members array is required'));
    }

    const conversation = await ConversationGroup.findOne({
      _id: conversationId,
      type: 'group',
      createdBy: userId, // Only creator can remove members
      status: 'active'
    });

    if (!conversation) {
      return res.status(404).json(errorResponse(404, 'Group conversation not found or you are not the creator'));
    }

    // Remove members
    conversation.members = conversation.members.filter(
      member => !members.includes(member._id.toString())
    );

    // Ensure at least 2 members remain
    if (conversation.members.length < 2) {
      return res.status(400).json(errorResponse(400, 'Group must have at least 2 members'));
    }

    await conversation.save();

    // Populate the updated conversation
    await conversation.populate('members._id', 'name email profilePicture');

    return res.status(200).json(successResponse(200, 'Members removed successfully', conversation));
  } catch (error) {
    console.error('Error removing members from group:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Update group conversation details
const updateGroupConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { name } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json(errorResponse(400, 'Group name is required'));
    }

    const conversation = await ConversationGroup.findOne({
      _id: conversationId,
      type: 'group',
      createdBy: userId, // Only creator can update
      status: 'active'
    });

    if (!conversation) {
      return res.status(404).json(errorResponse(404, 'Group conversation not found or you are not the creator'));
    }

    conversation.name = name;
    await conversation.save();

    // Populate the updated conversation
    await conversation.populate('members._id', 'name email profilePicture');

    return res.status(200).json(successResponse(200, 'Group updated successfully', conversation));
  } catch (error) {
    console.error('Error updating group conversation:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Leave a conversation
const leaveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await ConversationGroup.findOne({
      _id: conversationId,
      members: { $elemMatch: { _id: userId } },
      status: 'active'
    });

    if (!conversation) {
      return res.status(404).json(errorResponse(404, 'Conversation not found or you are not a member'));
    }

    // For 1-on-1 conversations, mark as deleted for the user
    if (conversation.type === '1on1') {
      if (!conversation.deletedFor) {
        conversation.deletedFor = [];
      }
      conversation.deletedFor.push(userId);
      conversation.status = 'deleted';
    } else {
      // For group conversations, remove the user
      conversation.members = conversation.members.filter(
        member => member._id.toString() !== userId.toString()
      );

      // If only one member left, delete the group
      if (conversation.members.length < 2) {
        conversation.status = 'deleted';
      }
    }

    await conversation.save();

    return res.status(200).json(successResponse(200, 'Left conversation successfully'));
  } catch (error) {
    console.error('Error leaving conversation:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

module.exports = {
  createOneOnOneConversation,
  createGroupConversation,
  getUserConversations,
  getConversationById,
  addMembersToGroup,
  removeMembersFromGroup,
  updateGroupConversation,
  leaveConversation
};
