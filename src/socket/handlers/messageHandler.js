const mongoose = require("mongoose");
const MessageModel = require("../../models/Message");
const ConversationGroup = require("../../models/conversation");
const onlineUsers = require("../onlineUsers");

const handleSendMessage = async (io, socket, data, callback) => {
  try {
    const {
      senderId,
      receiverId,
      message,
      messageType = "text",
      payload = {},
      conversationId,
      type,
      _id,
    } = data;

    if (!conversationId) {
      if (callback)
        callback({ success: false, error: "Missing conversationId" });
      return;
    }

    let conversation = null;
    if (mongoose.Types.ObjectId.isValid(conversationId)) {
      conversation = await ConversationGroup.findById(conversationId);
    } else {
      conversation = await ConversationGroup.findOne({ _id: conversationId });
    }

    // If conversation doesn't exist and it's a 1on1 chat, create it
    if (!conversation && type === "1on1") {
      if (!receiverId) {
        if (callback) callback({ success: false, error: "Missing receiverId for 1on1 chat" });
        return;
      }
      
      try {
        conversation = await ConversationGroup.create({
          _id: conversationId,
          type,
          members: [{ _id: senderId }, { _id: receiverId }],
          createdBy: senderId,
          createdAt: new Date(),
        });

        // Notify both users about new conversation
        [senderId, receiverId].forEach((memberId) => {
          const sid = onlineUsers[memberId.toString()];
          if (sid) {
            io.to(sid).emit("newConvoCreated", { success: true, conversation });
          }
        });
      } catch (convError) {
        console.error("Error creating conversation:", convError);
        if (callback) callback({ success: false, error: "Failed to create conversation: " + convError.message });
        return;
      }
    }

    // If still no conversation found, return error
    if (!conversation) {
      if (callback) callback({ success: false, error: "Conversation not found and could not be created" });
      return;
    }

    // Prepare message data - don't include _id to avoid duplicate key errors
    const chatData = {
      type,
      senderId,
      receiverId: receiverId,
      conversationId,
      message,
      messageType,
      payload,
      timestamp: new Date(),
      read: false,
      status: "save_on_server",
    };

    // Only include _id if it's provided and not causing conflicts
    if (_id && !await MessageModel.findById(_id)) {
      chatData._id = _id;
    }

    const savedMsg = await MessageModel.create(chatData);

    // Update conversation's last message
    await ConversationGroup.findByIdAndUpdate(
      conversation._id,
      { 
        lastMessage: savedMsg._id,
        lastMessageAt: new Date()
      }
    );

    // Emit to sender
    socket.emit("messageSent", { success: true, message: savedMsg });

    // Emit to receiver if online
    if (receiverId) {
      const receiverSocketId = onlineUsers[receiverId.toString()];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", savedMsg);
      }
    }

    if (callback) callback({ success: true, message: savedMsg });
  } catch (error) {
    console.error("Error sending message:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

const handleMarkMessagesRead = async (io, data) => {
  try {
    const { conversationId, userId } = data;
    
    await MessageModel.updateMany(
      { 
        conversationId,
        receiverId: userId,
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

    console.log(`Messages marked as read for user ${userId} in conversation ${conversationId}`);
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

const updateMessage = async (data, callback) => {
  try {
    const { messageId, message } = data;
    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { message },
      { new: true }
    );
    
    if (callback) callback({ success: true, message: updatedMessage });
  } catch (error) {
    console.error("Error updating message:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

const getAllMessagesOnServer = async (data, callback) => {
  try {
    const { conversationId } = data;
    const messages = await MessageModel.find({ conversationId })
      .populate('senderId', 'name email')
      .sort({ timestamp: 1 });
    
    if (callback) callback({ success: true, messages });
  } catch (error) {
    console.error("Error getting messages:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

const getAllMessagesOfReceiver = async (data, callback) => {
  try {
    const { receiverId } = data;
    const messages = await MessageModel.find({ receiverId })
      .populate('senderId', 'name email')
      .sort({ timestamp: -1 });
    
    if (callback) callback({ success: true, messages });
  } catch (error) {
    console.error("Error getting receiver messages:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

const updateWithUserAlertMessage = async (messageId, conversationId, statusOrUserId, callback, io) => {
  try {
    const message = await MessageModel.findById(messageId);
    if (message) {
      message.status = statusOrUserId;
      await message.save();
      
      if (callback) callback({ success: true, message });
    }
  } catch (error) {
    console.error("Error updating message alert:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

const getServerandUpdateReciever = async (data, callback, io, socket) => {
  try {
    const { conversationId, userId } = data;
    const messages = await MessageModel.find({ conversationId })
      .populate('senderId', 'name email')
      .sort({ timestamp: 1 });
    
    // Mark messages as read
    await MessageModel.updateMany(
      { conversationId, receiverId: userId, read: false },
      { read: true }
    );
    
    if (callback) callback({ success: true, messages });
  } catch (error) {
    console.error("Error getting and updating messages:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

const updateMsgAsRead = async (data, callback, io, socket) => {
  try {
    const { messageId, userId } = data;
    const message = await MessageModel.findByIdAndUpdate(
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
    );
    
    if (callback) callback({ success: true, message });
  } catch (error) {
    console.error("Error updating message as read:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

const getMsgAsRead = async (data, callback, io, socket) => {
  try {
    const { conversationId } = data;
    const messages = await MessageModel.find({ 
      conversationId, 
      read: true 
    }).populate('senderId', 'name email');
    
    if (callback) callback({ success: true, messages });
  } catch (error) {
    console.error("Error getting read messages:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

module.exports = {
  handleSendMessage,
  handleMarkMessagesRead,
  updateMessage,
  getAllMessagesOnServer,
  getAllMessagesOfReceiver,
  updateWithUserAlertMessage,
  getServerandUpdateReciever,
  updateMsgAsRead,
  getMsgAsRead,
};
