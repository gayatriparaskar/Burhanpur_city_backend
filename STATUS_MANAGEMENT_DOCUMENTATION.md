# Status Management System Documentation

This document describes the status management system for users and businesses, including blocking functionality and its impact on system operations.

## Overview

The status management system allows administrators to control user and business account states with three possible statuses:
- **active**: Normal operation, full access to all features
- **inactive**: Limited access, cannot perform certain actions
- **blocked**: Severely restricted access, cannot perform most actions

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

## API Endpoints

### User Status Management

#### 1. Update User Status
**PUT** `/api/status/user/:userId`

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
**GET** `/api/status/user/:userId`

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
**GET** `/api/status/users?status=blocked&page=1&limit=10`

Retrieves users filtered by status with pagination.

**Query Parameters:**
- `status` (optional): Filter by status (active, inactive, blocked)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Users per page (default: 10)

#### 4. Bulk Update User Status
**PUT** `/api/status/users/bulk`

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

#### 1. Update Business Status
**PUT** `/api/status/business/:businessId`

Updates a business's status (Admin only).

**Request Body:**
```json
{
  "status": "blocked",
  "reason": "Fraudulent activities reported"
}
```

#### 2. Get Business Status
**GET** `/api/status/business/:businessId`

Retrieves a business's current status.

#### 3. Get Businesses by Status
**GET** `/api/status/businesses?status=active&page=1&limit=10`

Retrieves businesses filtered by status with pagination.

#### 4. Bulk Update Business Status
**PUT** `/api/status/businesses/bulk`

Updates multiple businesses' status at once (Admin only).

## Impact on System Operations

### Booking System
When a user or business is blocked/inactive:

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

### Status Check Middleware
```javascript
const { checkUserStatus, checkBusinessStatus, preventBlockedUserBooking } = require('../middleware/statusCheck');

// Apply to routes that need status checking
router.post('/bookings', preventBlockedUserBooking, createBooking);
router.get('/user/:userId', checkUserStatus, getUserDetails);
```

### Available Middleware Functions:
- `checkUserStatus`: Validates user status before allowing access
- `checkBusinessStatus`: Validates business status before allowing access
- `checkUserAndBusinessStatus`: Validates both user and business status
- `preventBlockedUserBooking`: Specifically prevents blocked users from creating bookings

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

## Usage Examples

### 1. Block a User
```javascript
// Block user for terms violation
PUT /api/status/user/64a1b2c3d4e5f6789012345
{
  "status": "blocked",
  "reason": "Multiple reports of harassment"
}
```

### 2. Deactivate a Business
```javascript
// Make business inactive
PUT /api/status/business/64a1b2c3d4e5f6789012346
{
  "status": "inactive",
  "reason": "Temporary suspension for review"
}
```

### 3. Bulk Block Users
```javascript
// Block multiple users
PUT /api/status/users/bulk
{
  "userIds": ["user1", "user2", "user3"],
  "status": "blocked",
  "reason": "Suspicious activity in batch"
}
```

### 4. Get All Blocked Users
```javascript
// Get all blocked users
GET /api/status/users?status=blocked&page=1&limit=20
```

## Security Considerations

1. **Admin Only Access**: Status update endpoints require admin authorization
2. **Audit Trail**: All status changes should be logged
3. **Reversible Actions**: Status changes can be reversed by admins
4. **User Notification**: Consider notifying users when their status changes
5. **Graceful Degradation**: System continues to work for active users when others are blocked

## Migration Notes

For existing users and businesses:
1. All existing records will have `status: 'active'` by default
2. No immediate impact on existing functionality
3. Gradually implement status checks in critical endpoints
4. Monitor system performance after implementation

## Monitoring and Analytics

Track status changes for:
- User behavior analysis
- Business performance metrics
- System abuse prevention
- Support ticket patterns
- Account recovery rates

This status management system provides comprehensive control over user and business access while maintaining system stability and security.

