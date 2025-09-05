const MessageModel = require("../../models/Message");

const handleSingleMessageRead = async (io, socket, data) => {
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
    
    if (message) {
      socket.emit("messageRead", { success: true, messageId });
    }
  } catch (error) {
    console.error("Error marking single message as read:", error);
    socket.emit("messageRead", { success: false, error: error.message });
  }
};

module.exports = handleSingleMessageRead;
