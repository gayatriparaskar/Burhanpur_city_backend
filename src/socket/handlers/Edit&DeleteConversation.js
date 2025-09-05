const ConversationGroup = require("../../models/conversation");

const handleEditConversation = async (io, socket, data, callback) => {
  try {
    const { conversationId, name } = data;
    
    const conversation = await ConversationGroup.findByIdAndUpdate(
      conversationId,
      { name },
      { new: true }
    );
    
    if (conversation) {
      io.to(conversationId).emit("conversationUpdated", { conversation });
      if (callback) callback({ success: true, conversation });
    } else {
      if (callback) callback({ success: false, error: "Conversation not found" });
    }
  } catch (error) {
    console.error("Error editing conversation:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

const handleDeleteConversation = async (io, socket, data, callback) => {
  try {
    const { conversationId, userId } = data;
    
    const conversation = await ConversationGroup.findById(conversationId);
    if (conversation) {
      // Soft delete - add user to deletedFor array
      if (!conversation.deletedFor) {
        conversation.deletedFor = [];
      }
      
      if (!conversation.deletedFor.includes(userId)) {
        conversation.deletedFor.push(userId);
        await conversation.save();
      }
      
      io.to(conversationId).emit("conversationDeleted", { conversationId, userId });
      if (callback) callback({ success: true });
    } else {
      if (callback) callback({ success: false, error: "Conversation not found" });
    }
  } catch (error) {
    console.error("Error deleting conversation:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

module.exports = {
  handleEditConversation,
  handleDeleteConversation,
};
