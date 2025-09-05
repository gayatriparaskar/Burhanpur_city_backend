const peers = {};

const registerWebRTCUser = (socket) => {
  peers[socket.id] = socket;
  console.log(`WebRTC user registered: ${socket.id}`);
};

const handleOffer = (socket, data) => {
  socket.to(data.roomId).emit("offer", data);
};

const handleAnswer = (socket, data) => {
  socket.to(data.roomId).emit("answer", data);
};

const handleCandidate = (socket, data) => {
  socket.to(data.roomId).emit("candidate", data);
};

const handleWebRTCDisconnect = (socket) => {
  delete peers[socket.id];
  console.log(`WebRTC user disconnected: ${socket.id}`);
};

module.exports = {
  registerWebRTCUser,
  handleOffer,
  handleAnswer,
  handleCandidate,
  handleWebRTCDisconnect,
};
