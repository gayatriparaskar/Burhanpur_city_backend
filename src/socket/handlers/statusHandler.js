const UserModel = require("../../models/User");
const onlineUsers = require("../onlineUsers");

const handleUserOnline = (socket, userId) => {
  onlineUsers[userId] = socket.id;
  console.log("🟢 User online:", userId, socket.id);
  
  // Update user status in database
  UserModel.findByIdAndUpdate(userId, { 
    online_status: "online",
    last_seen: new Date()
  }).catch(err => console.error("Error updating user status:", err));
};

const handleJoinConversation = (socket, conversationId) => {
  socket.join(conversationId);
  console.log(`User joined conversation: ${conversationId}`);
};

const handleJoin = (socket, data) => {
  socket.join(data.room);
  console.log(`User joined room: ${data.room}`);
};

const handleUserInfo = async (socket, { userId }) => {
  try {
    const user = await UserModel.findById(userId).select('-password');
    if (user) {
      socket.emit("userInfo", user);
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
};

module.exports = {
  handleUserOnline,
  handleJoinConversation,
  handleJoin,
  handleUserInfo,
};
