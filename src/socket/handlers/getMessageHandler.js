const MessageModel = require("../../models/Message");
const ConversationGroup = require("../../models/conversation");

const handleGetMessage = async (data, callback) => {
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

const handleAllChatList = async (data, callback) => {
  try {
    const { userId } = data;
    const conversations = await ConversationGroup.find({
      members: { $elemMatch: { _id: userId } }
    })
    .populate('members._id', 'name email')
    .sort({ updatedAt: -1 });
    
    if (callback) callback({ success: true, conversations });
  } catch (error) {
    console.error("Error getting chat list:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

const getAllConversation = async (data, callback) => {
  try {
    const { userId } = data;
    const conversations = await ConversationGroup.find({
      members: { $elemMatch: { _id: userId } }
    })
    .populate('members._id', 'name email')
    .sort({ updatedAt: -1 });
    
    if (callback) callback({ success: true, conversations });
  } catch (error) {
    console.error("Error getting conversations:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

const updateConversation = async (data, callback) => {
  try {
    const { conversationId, updateData } = data;
    const conversation = await ConversationGroup.findByIdAndUpdate(
      conversationId,
      updateData,
      { new: true }
    );
    
    if (callback) callback({ success: true, conversation });
  } catch (error) {
    console.error("Error updating conversation:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

module.exports = {
  handleGetMessage,
  handleAllChatList,
  getAllConversation,
  updateConversation,
};
