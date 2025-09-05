const ConversationGroup = require("../../models/conversation");
const onlineUsers = require("../onlineUsers");

const handleCreateGroup = async (io, socket, data, callback) => {
  try {
    const { name, members, createdBy } = data;
    
    const group = new ConversationGroup({
      name,
      type: "group",
      members: members.map(member => ({ _id: member })),
      createdBy,
      createdAt: new Date(),
    });

    await group.save();

    // Join all members to the group room
    members.forEach(memberId => {
      const socketId = onlineUsers[memberId.toString()];
      if (socketId) {
        io.to(socketId).emit("groupCreated", { success: true, group });
      }
    });

    if (callback) callback({ success: true, group });
  } catch (error) {
    console.error("Error creating group:", error);
    if (callback) callback({ success: false, error: error.message });
  }
};

const handleJoinGroup = async (socket, groupId) => {
  try {
    socket.join(groupId);
    console.log(`User joined group: ${groupId}`);
  } catch (error) {
    console.error("Error joining group:", error);
  }
};

module.exports = {
  handleCreateGroup,
  handleJoinGroup,
};
