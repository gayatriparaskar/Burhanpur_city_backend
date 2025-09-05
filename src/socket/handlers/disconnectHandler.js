const UserModel = require("../../models/User");
const onlineUsers = require("../onlineUsers");

const handleDisconnect = async (socket) => {
  try {
    console.log("🔴 User disconnected:", socket.id);
    
    // Find and remove user from online users
    for (const [userId, socketId] of Object.entries(onlineUsers)) {
      if (socketId === socket.id) {
        delete onlineUsers[userId];
        console.log("🔴 User offline:", userId);
        
        // Update user status in database
        await UserModel.findByIdAndUpdate(userId, { 
          online_status: "offline",
          last_seen: new Date()
        });
        break;
      }
    }
  } catch (error) {
    console.error("Error handling disconnect:", error);
  }
};

module.exports = { handleDisconnect };
