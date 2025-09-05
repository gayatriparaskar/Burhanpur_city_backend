const MessageModel = require("../../models/Message");

const editMessage = async (socket, io, data, callback) => {
  try {
    const { messageId, message, userId } = data;
    
    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { message, edited: true, editedAt: new Date() },
      { new: true }
    );
    
    if (updatedMessage) {
      io.to(updatedMessage.conversationId).emit("messageEdited", { 
        messageId, 
        message, 
        editedBy: userId 
      });
      if (callback) callback({ success: true, message: updatedMessage });
    } else {
      if (callback) callback({ success: false, error: "Message not found" });
    }
  } catch (error) {
    console.error("Error editing message:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

const deleteMessage = async (socket, data, callback) => {
  try {
    const { messageId, userId } = data;
    
    const message = await MessageModel.findByIdAndUpdate(
      messageId,
      { 
        deleted: true, 
        deletedBy: userId,
        deletedAt: new Date()
      },
      { new: true }
    );
    
    if (message) {
      socket.to(message.conversationId).emit("messageDeleted", { 
        messageId, 
        deletedBy: userId 
      });
      if (callback) callback({ success: true });
    } else {
      if (callback) callback({ success: false, error: "Message not found" });
    }
  } catch (error) {
    console.error("Error deleting message:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

module.exports = {
  editMessage,
  deleteMessage,
};
