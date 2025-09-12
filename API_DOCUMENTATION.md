# Conversation and Message API Documentation

This document provides comprehensive documentation for the conversation and message APIs that support both 1-on-1 and group chats.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Conversation APIs

### 1. Create 1-on-1 Conversation
**POST** `/conversations/1on1`

Creates a new 1-on-1 conversation between the authenticated user and another user.

**Request Body:**
```json
{
  "receiverId": "64a1b2c3d4e5f6789012345"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "1-on-1 conversation created successfully",
  "data": {
    "_id": "conv_123456789",
    "type": "1on1",
    "members": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "John Doe",
        "email": "john@example.com",
        "profilePicture": "profile.jpg"
      },
      {
        "_id": "64a1b2c3d4e5f6789012346",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "profilePicture": "profile2.jpg"
      }
    ],
    "createdBy": "64a1b2c3d4e5f6789012345",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Create Group Conversation
**POST** `/conversations/group`

Creates a new group conversation with multiple members.

**Request Body:**
```json
{
  "name": "Project Team",
  "members": ["64a1b2c3d4e5f6789012345", "64a1b2c3d4e5f6789012346", "64a1b2c3d4e5f6789012347"]
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Group conversation created successfully",
  "data": {
    "_id": "conv_group_123456789",
    "name": "Project Team",
    "type": "group",
    "members": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "John Doe",
        "email": "john@example.com"
      },
      {
        "_id": "64a1b2c3d4e5f6789012346",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      {
        "_id": "64a1b2c3d4e5f6789012347",
        "name": "Bob Wilson",
        "email": "bob@example.com"
      }
    ],
    "createdBy": "64a1b2c3d4e5f6789012345",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Get User Conversations
**GET** `/conversations`

Retrieves all conversations for the authenticated user.

**Query Parameters:**
- None

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Conversations retrieved successfully",
  "data": [
    {
      "_id": "conv_123456789",
      "type": "1on1",
      "members": [...],
      "lastMessage": {
        "_id": "msg_123456789",
        "message": "Hello there!",
        "timestamp": "2024-01-15T11:00:00.000Z"
      },
      "lastMessageAt": "2024-01-15T11:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 4. Get Conversation by ID
**GET** `/conversations/:conversationId`

Retrieves a specific conversation by its ID.

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Conversation retrieved successfully",
  "data": {
    "_id": "conv_123456789",
    "type": "1on1",
    "members": [...],
    "lastMessage": {...},
    "createdBy": "64a1b2c3d4e5f6789012345",
    "status": "active"
  }
}
```

### 5. Add Members to Group
**POST** `/conversations/:conversationId/members`

Adds new members to an existing group conversation.

**Request Body:**
```json
{
  "members": ["64a1b2c3d4e5f6789012348", "64a1b2c3d4e5f6789012349"]
}
```

### 6. Remove Members from Group
**DELETE** `/conversations/:conversationId/members`

Removes members from a group conversation (creator only).

**Request Body:**
```json
{
  "members": ["64a1b2c3d4e5f6789012348"]
}
```

### 7. Update Group Conversation
**PUT** `/conversations/:conversationId`

Updates group conversation details (creator only).

**Request Body:**
```json
{
  "name": "Updated Group Name"
}
```

### 8. Leave Conversation
**DELETE** `/conversations/:conversationId/leave`

Allows a user to leave a conversation.

---

## Message APIs

### 1. Send Message
**POST** `/messages`

Sends a message to a conversation.

**Request Body:**
```json
{
  "conversationId": "conv_123456789",
  "message": "Hello everyone!",
  "messageType": "text",
  "fileUrl": "https://example.com/file.pdf",
  "payload": {
    "customData": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Message sent successfully",
  "data": {
    "_id": "msg_123456789",
    "conversationId": "conv_123456789",
    "senderId": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePicture": "profile.jpg"
    },
    "receiverId": "64a1b2c3d4e5f6789012346",
    "message": "Hello everyone!",
    "messageType": "text",
    "fileUrl": "https://example.com/file.pdf",
    "payload": {
      "customData": "value"
    },
    "timestamp": "2024-01-15T11:00:00.000Z",
    "read": false,
    "status": "saved",
    "edited": false,
    "deleted": false
  }
}
```

### 2. Get Messages
**GET** `/messages/conversation/:conversationId`

Retrieves messages from a conversation with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50)

**Example:**
```
GET /messages/conversation/conv_123456789?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "msg_123456789",
        "conversationId": "conv_123456789",
        "senderId": {
          "_id": "64a1b2c3d4e5f6789012345",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "message": "Hello everyone!",
        "timestamp": "2024-01-15T11:00:00.000Z",
        "read": true,
        "edited": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalMessages": 150,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. Mark Messages as Read
**PUT** `/messages/conversation/:conversationId/read`

Marks all unread messages in a conversation as read.

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Messages marked as read",
  "data": {
    "modifiedCount": 5
  }
}
```

### 4. Mark Single Message as Read
**PUT** `/messages/:messageId/read`

Marks a specific message as read.

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Message marked as read",
  "data": {
    "_id": "msg_123456789",
    "read": true,
    "seenBy": [
      {
        "userId": "64a1b2c3d4e5f6789012346",
        "timestamp": "2024-01-15T11:05:00.000Z"
      }
    ]
  }
}
```

### 5. Edit Message
**PUT** `/messages/:messageId`

Edits a message (sender only).

**Request Body:**
```json
{
  "message": "Updated message content"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Message updated successfully",
  "data": {
    "_id": "msg_123456789",
    "message": "Updated message content",
    "edited": true,
    "editedAt": "2024-01-15T11:10:00.000Z"
  }
}
```

### 6. Delete Message
**DELETE** `/messages/:messageId`

Deletes a message (sender only, soft delete).

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Message deleted successfully",
  "data": {
    "_id": "msg_123456789",
    "deleted": true,
    "deletedBy": "64a1b2c3d4e5f6789012345",
    "deletedAt": "2024-01-15T11:15:00.000Z"
  }
}
```

### 7. Get Unread Message Count
**GET** `/messages/unread/count`

Gets the total unread message count for all conversations.

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Unread count retrieved",
  "data": {
    "unreadCount": 12
  }
}
```

### 8. Get Conversation Unread Count
**GET** `/messages/unread/count/:conversationId`

Gets the unread message count for a specific conversation.

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Unread count retrieved",
  "data": {
    "unreadCount": 3
  }
}
```

---

## Message Types

The API supports various message types:

- `text`: Regular text message
- `visitor`: Visitor notification
- `checkin`: Check-in notification
- `checkout`: Check-out notification
- `task`: Task-related message
- `note`: Note message
- `file`: File attachment
- `splitMoney`: Money splitting notification

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "error": "Detailed error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Socket.IO Integration

The existing socket handlers work seamlessly with these APIs:

- `sendMessage` socket event for real-time messaging
- `getMessages` socket event for retrieving messages
- `markMessagesRead` socket event for marking messages as read
- `createGroup` socket event for creating groups
- `joinGroup` socket event for joining groups

The APIs provide REST endpoints while the socket handlers provide real-time functionality.
