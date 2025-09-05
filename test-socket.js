const io = require('socket.io-client');

// Test socket connection
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('✅ Connected to server');
  
  // Test user online
  socket.emit('userOnline', 'test-user-id');
  
  // Test join conversation
  socket.emit('joinConversation', 'test-conversation-id');
  
  // Test send message
  socket.emit('sendMessage', {
    senderId: 'test-sender-id',
    receiverId: 'test-receiver-id',
    message: 'Hello from test!',
    conversationId: 'test-conversation-id',
    type: '1on1',
    _id: 'test-message-id'
  }, (response) => {
    console.log('Message response:', response);
  });
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('newMessage', (message) => {
  console.log('📨 New message received:', message);
});

socket.on('userInfo', (data) => {
  console.log('👤 User info:', data);
});

// Test WebRTC call
socket.emit('startCall', {
  fromUserId: 'test-sender-id',
  toUserId: 'test-receiver-id',
  isVideo: true,
  roomId: 'test-room-id'
});

socket.on('incomingCall', (data) => {
  console.log('📞 Incoming call:', data);
});

console.log('🧪 Socket test client started. Make sure the server is running on port 5000');
