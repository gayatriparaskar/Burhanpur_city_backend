const onlineUsers = require("../onlineUsers");

const handleStartCall = (io, socket, { fromUserId, toUserId, isVideo, roomId }) => {
  const toSocketId = onlineUsers[toUserId];
  
  if (toSocketId) {
    io.to(toSocketId).emit("incomingCall", {
      fromUserId,
      isVideo,
      roomId,
    });
    console.log(`Call initiated from ${fromUserId} to ${toUserId}`);
  } else {
    socket.emit("userOffline", { toUserId });
  }
};

const handleCallDeclined = (io, socket, { toUserId }) => {
  const toSocketId = onlineUsers[toUserId];
  if (toSocketId) {
    io.to(toSocketId).emit("callDeclined", { from: socket.id });
  }
};

const handleJoinCall = (io, socket, roomId) => {
  socket.join(roomId);
  console.log(`User joined call room: ${roomId}`);
};

const handleSignal = (io, socket, data) => {
  socket.to(data.roomId).emit("signal", data);
};

const handleLeaveCall = (io, socket, roomId) => {
  socket.leave(roomId);
  socket.to(roomId).emit("userLeftCall", { userId: socket.id });
  console.log(`User left call room: ${roomId}`);
};

module.exports = {
  handleStartCall,
  handleCallDeclined,
  handleJoinCall,
  handleSignal,
  handleLeaveCall,
};
