/**
 * Test script for Conversation and Message APIs
 * Run this with: node test-conversation-apis.js
 * 
 * Make sure to:
 * 1. Start your server first
 * 2. Replace the JWT token with a valid one
 * 3. Replace user IDs with valid ones from your database
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const JWT_TOKEN = 'your-jwt-token-here'; // Replace with actual JWT token
const USER_ID_1 = '64a1b2c3d4e5f6789012345'; // Replace with actual user ID
const USER_ID_2 = '64a1b2c3d4e5f6789012346'; // Replace with actual user ID

const headers = {
  'Authorization': `Bearer ${JWT_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testConversationAPIs() {
  console.log('🚀 Testing Conversation and Message APIs...\n');

  try {
    // Test 1: Create 1-on-1 conversation
    console.log('1. Creating 1-on-1 conversation...');
    const oneOnOneResponse = await axios.post(`${BASE_URL}/conversations/1on1`, {
      receiverId: USER_ID_2
    }, { headers });
    
    console.log('✅ 1-on-1 conversation created:', oneOnOneResponse.data.data._id);
    const conversationId = oneOnOneResponse.data.data._id;

    // Test 2: Create group conversation
    console.log('\n2. Creating group conversation...');
    const groupResponse = await axios.post(`${BASE_URL}/conversations/group`, {
      name: 'Test Group',
      members: [USER_ID_2]
    }, { headers });
    
    console.log('✅ Group conversation created:', groupResponse.data.data._id);
    const groupId = groupResponse.data.data._id;

    // Test 3: Get user conversations
    console.log('\n3. Getting user conversations...');
    const conversationsResponse = await axios.get(`${BASE_URL}/conversations`, { headers });
    console.log('✅ Found', conversationsResponse.data.data.length, 'conversations');

    // Test 4: Send message to 1-on-1 conversation
    console.log('\n4. Sending message to 1-on-1 conversation...');
    const messageResponse = await axios.post(`${BASE_URL}/messages`, {
      conversationId: conversationId,
      message: 'Hello! This is a test message.',
      messageType: 'text'
    }, { headers });
    
    console.log('✅ Message sent:', messageResponse.data.data._id);
    const messageId = messageResponse.data.data._id;

    // Test 5: Send message to group conversation
    console.log('\n5. Sending message to group conversation...');
    const groupMessageResponse = await axios.post(`${BASE_URL}/messages`, {
      conversationId: groupId,
      message: 'Hello group! This is a group message.',
      messageType: 'text'
    }, { headers });
    
    console.log('✅ Group message sent:', groupMessageResponse.data.data._id);

    // Test 6: Get messages from conversation
    console.log('\n6. Getting messages from 1-on-1 conversation...');
    const messagesResponse = await axios.get(`${BASE_URL}/messages/conversation/${conversationId}`, { headers });
    console.log('✅ Found', messagesResponse.data.data.messages.length, 'messages');

    // Test 7: Mark messages as read
    console.log('\n7. Marking messages as read...');
    const markReadResponse = await axios.put(`${BASE_URL}/messages/conversation/${conversationId}/read`, {}, { headers });
    console.log('✅ Marked', markReadResponse.data.data.modifiedCount, 'messages as read');

    // Test 8: Get unread count
    console.log('\n8. Getting unread message count...');
    const unreadResponse = await axios.get(`${BASE_URL}/messages/unread/count`, { headers });
    console.log('✅ Unread count:', unreadResponse.data.data.unreadCount);

    // Test 9: Edit message
    console.log('\n9. Editing message...');
    const editResponse = await axios.put(`${BASE_URL}/messages/${messageId}`, {
      message: 'This message has been edited!'
    }, { headers });
    console.log('✅ Message edited successfully');

    // Test 10: Add member to group
    console.log('\n10. Adding member to group...');
    const addMemberResponse = await axios.post(`${BASE_URL}/conversations/${groupId}/members`, {
      members: [USER_ID_1] // Adding self back (for testing)
    }, { headers });
    console.log('✅ Member added to group');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- 1-on-1 conversation created and tested');
    console.log('- Group conversation created and tested');
    console.log('- Messages sent and retrieved');
    console.log('- Read status updated');
    console.log('- Message editing tested');
    console.log('- Group management tested');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Make sure to:');
      console.log('1. Replace JWT_TOKEN with a valid token');
      console.log('2. Make sure the user is authenticated');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Make sure to:');
      console.log('1. Replace USER_ID_1 and USER_ID_2 with valid user IDs');
      console.log('2. Make sure the users exist in the database');
    }
  }
}

// Run the tests
testConversationAPIs();
