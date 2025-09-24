# Simple Status Management System

This document describes the simplified status management system where status updates are integrated directly into the existing update functions for users and businesses.

## Overview

Status management is now integrated into the existing `updateUser` and `updateBussiness` functions. No separate status management endpoints are needed - everything is handled through the standard update APIs.

## Status Levels

### 1. **Active Status** (default)
- ✅ Full access to all features
- ✅ Can create bookings
- ✅ Can send messages
- ✅ Normal operations

### 2. **Inactive Status**
- ❌ Cannot create bookings
- ❌ Cannot send messages
- ❌ Limited access to features
- ✅ Can view their own data

### 3. **Blocked Status**
- ❌ Cannot create bookings
- ❌ Cannot send messages
- ❌ Severely restricted access
- ✅ Can view their own data

## API Usage

### Update User Status
**PUT** `/api/Users/updatedUser/:id`

Update any user field including status:

```json
{
  "name": "John Doe",
  "status": "blocked",
  "statusReason": "Terms of service violation"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User is updated successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "blocked",
    "statusReason": "Terms of service violation",
    "phone": "9876543210",
    "role": "user"
  }
}
```

### Update Business Status
**PUT** `/api/bussiness/updateBuss/:id`

Update any business field including status:

```json
{
  "name": "ABC Hotel",
  "status": "inactive",
  "statusReason": "Temporary suspension for review"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bussiness is updated",
  "data": {
    "_id": "64a1b2c3d4e5f6789012346",
    "name": "ABC Hotel",
    "status": "inactive",
    "statusReason": "Temporary suspension for review",
    "isActive": true,
    "isVerified": false
  }
}
```

## Status Validation

The system automatically validates status values:

- ✅ **Valid statuses**: `active`, `inactive`, `blocked`
- ❌ **Invalid status**: Returns 400 error with message

### Example Error Response:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid status. Must be active, inactive, or blocked"
}
```

## Database Schema

### User Model
```javascript
{
  // ... existing fields
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'blocked'], 
    default: 'active' 
  },
  statusReason: { type: String }, // Optional reason for status change
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
  statusReason: { type: String }, // Optional reason for status change
  // ... other fields
}
```

## Usage Examples

### 1. Block a User
```javascript
PUT /api/Users/updatedUser/64a1b2c3d4e5f6789012345
{
  "status": "blocked",
  "statusReason": "Multiple reports of harassment"
}
```

### 2. Make Business Inactive
```javascript
PUT /api/bussiness/updateBuss/64a1b2c3d4e5f6789012346
{
  "status": "inactive",
  "statusReason": "Under review for compliance"
}
```

### 3. Reactivate User
```javascript
PUT /api/Users/updatedUser/64a1b2c3d4e5f6789012345
{
  "status": "active",
  "statusReason": "Issue resolved"
}
```

### 4. Update Multiple Fields with Status
```javascript
PUT /api/Users/updatedUser/64a1b2c3d4e5f6789012345
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "status": "active",
  "statusReason": "Account verified"
}
```

## System Impact

### Booking System
The booking system automatically checks user and business status:

- **Blocked users**: Cannot create bookings
- **Blocked businesses**: Cannot accept bookings
- **Inactive accounts**: Limited access to features

### Error Messages
When blocked/inactive users try to create bookings:

```json
{
  "success": false,
  "message": "Blocked users cannot create bookings. Please contact support."
}
```

## Benefits of Simplified Approach

1. ✅ **Single API**: Use existing update endpoints
2. ✅ **No New Routes**: No additional complexity
3. ✅ **Familiar Pattern**: Same as updating any other field
4. ✅ **Flexible**: Can update status along with other fields
5. ✅ **Simple**: Easy to understand and use

## Security

- Status validation ensures only valid values are accepted
- Existing authentication and authorization still apply
- Status changes are logged in the database
- Booking system enforces status restrictions

This simplified approach makes status management part of the standard update workflow, making it easier to use and maintain!



