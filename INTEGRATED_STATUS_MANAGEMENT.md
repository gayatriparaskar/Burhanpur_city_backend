# Integrated Status Management System

This document describes the integrated status management system for users and businesses, where status management functions are added to existing User and Business controllers and routers.

## Overview

The status management system has been integrated into existing controllers and routers instead of creating separate ones. This provides a cleaner API structure where status management is part of the core user and business functionality.

## Status Levels

### 1. **Active Status**
- ✅ Full access to all features
- ✅ Can create bookings
- ✅ Can send messages
- ✅ Can participate in conversations
- ✅ Normal user/business operations

### 2. **Inactive Status**
- ❌ Cannot create bookings
- ❌ Cannot send messages
- ❌ Limited access to features
- ✅ Can view their own data
- ✅ Can contact support for reactivation

### 3. **Blocked Status**
- ❌ Cannot create bookings
- ❌ Cannot send messages
- ❌ Cannot participate in conversations
- ❌ Severely restricted access
- ✅ Can view their own data
- ✅ Can contact support for unblocking

## API Endpoints

### User Status Management

All user status endpoints are under `/api/Users/status/`

#### 1. Update User Status
**PUT** `/api/Users/status/:userId`

Updates a user's status (Admin only).

**Request Body:**
```json
{
  "status": "blocked",
  "reason": "Violation of terms of service"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User status updated to blocked",
  "data": {
    "userId": "64a1b2c3d4e5f6789012345",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "blocked",
    "statusReason": "Violation of terms of service"
  }
}
```

#### 2. Get User Status
**GET** `/api/Users/status/:userId`

Retrieves a user's current status.

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User status retrieved",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active",
    "statusReason": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 3. Get Users by Status
**GET** `/api/Users/status?status=blocked&page=1&limit=10`

Retrieves users filtered by status with pagination (Admin only).

**Query Parameters:**
- `status` (optional): Filter by status (active, inactive, blocked)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Users per page (default: 10)

#### 4. Bulk Update User Status
**PUT** `/api/Users/status/bulk`

Updates multiple users' status at once (Admin only).

**Request Body:**
```json
{
  "userIds": ["64a1b2c3d4e5f6789012345", "64a1b2c3d4e5f6789012346"],
  "status": "inactive",
  "reason": "Suspicious activity detected"
}
```

### Business Status Management

All business status endpoints are under `/api/bussiness/status/`

#### 1. Update Business Status
**PUT** `/api/bussiness/status/:businessId`

Updates a business's status (Admin only).

**Request Body:**
```json
{
  "status": "blocked",
  "reason": "Fraudulent activities reported"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Business status updated to blocked",
  "data": {
    "businessId": "64a1b2c3d4e5f6789012346",
    "name": "ABC Hotel",
    "status": "blocked",
    "statusReason": "Fraudulent activities reported"
  }
}
```

#### 2. Get Business Status
**GET** `/api/bussiness/status/:businessId`

Retrieves a business's current status.

#### 3. Get Businesses by Status
**GET** `/api/bussiness/status?status=active&page=1&limit=10`

Retrieves businesses filtered by status with pagination (Admin only).

#### 4. Bulk Update Business Status
**PUT** `/api/bussiness/status/bulk`

Updates multiple businesses' status at once (Admin only).

**Request Body:**
```json
{
  "businessIds": ["64a1b2c3d4e5f6789012346", "64a1b2c3d4e5f6789012347"],
  "status": "inactive",
  "reason": "Temporary suspension for review"
}
```

## Database Schema Updates

### User Model
```javascript
{
  // ... existing fields
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'blocked'], 
    default: 'active' 
  },
  statusReason: { type: String }, // Reason for status change
  // ... other fields
}
```

### Business Model
```javascript
{
  // ... existing fields
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'blocked'], 
    default: 'active' 
  },
  statusReason: { type: String }, // Reason for status change
  // ... other fields
}
```

## Impact on System Operations

### Booking System
When a user or business is blocked/inactive, the booking system automatically prevents them from creating or accepting bookings:

```javascript
// User tries to create booking
POST /api/bookings
{
  "user_id": "blocked_user_id",
  "business_id": "active_business_id",
  "product_id": "product_id",
  "type": "Management & Service"
}

// Response for blocked user
{
  "success": false,
  "message": "Blocked users cannot create bookings. Please contact support."
}
```

### Message System
Blocked users cannot:
- Send messages
- Create conversations
- Participate in group chats

### Business Operations
Blocked businesses cannot:
- Accept new bookings
- Update their profile
- Access business dashboard features

## Middleware Integration

The status check middleware is available for use in other routes:

```javascript
const { checkUserStatus, checkBusinessStatus, preventBlockedUserBooking } = require('../middleware/statusCheck');

// Apply to routes that need status checking
router.post('/bookings', preventBlockedUserBooking, createBooking);
router.get('/user/:userId', checkUserStatus, getUserDetails);
```

## Usage Examples

### 1. Block a User
```javascript
// Block user for terms violation
PUT /api/Users/status/64a1b2c3d4e5f6789012345
{
  "status": "blocked",
  "reason": "Multiple reports of harassment"
}
```

### 2. Deactivate a Business
```javascript
// Make business inactive
PUT /api/bussiness/status/64a1b2c3d4e5f6789012346
{
  "status": "inactive",
  "reason": "Temporary suspension for review"
}
```

### 3. Bulk Block Users
```javascript
// Block multiple users
PUT /api/Users/status/bulk
{
  "userIds": ["user1", "user2", "user3"],
  "status": "blocked",
  "reason": "Suspicious activity in batch"
}
```

### 4. Get All Blocked Users
```javascript
// Get all blocked users
GET /api/Users/status?status=blocked&page=1&limit=20
```

### 5. Get All Active Businesses
```javascript
// Get all active businesses
GET /api/bussiness/status?status=active&page=1&limit=20
```

## Error Responses

### User Blocked
```json
{
  "success": false,
  "statusCode": 403,
  "message": "User account is blocked. Please contact support."
}
```

### Business Blocked
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Business account is blocked. Please contact support."
}
```

### Inactive Account
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Account is inactive. Please contact support to reactivate."
}
```

## Security Features

1. **Admin Only Access**: Status update endpoints require admin authorization
2. **Audit Trail**: All status changes include reason tracking
3. **Reversible Actions**: Status changes can be reversed by admins
4. **Graceful Degradation**: System continues to work for active users when others are blocked
5. **Bulk Operations**: Efficient management of multiple accounts

## Integration Benefits

1. **Cleaner API Structure**: Status management is part of core user/business functionality
2. **Consistent Authentication**: Uses existing auth middleware
3. **Unified Error Handling**: Consistent error responses across all endpoints
4. **Easier Maintenance**: All related functionality in one place
5. **Better Organization**: Logical grouping of related features

This integrated approach provides comprehensive status management while maintaining a clean and organized API structure.





