# Business Approval System Documentation

## Overview
The business approval system ensures that all new businesses go through an admin approval process before becoming active on the platform. This system includes notifications, status tracking, and admin management features.

## Features

### 1. Business Status Management
- **Pending**: New businesses start with "pending" status
- **Approved**: Admin-approved businesses become active
- **Rejected**: Admin-rejected businesses with reason

### 2. Notification System
- Admin notifications when new businesses are submitted
- Business owner notifications for approval/rejection
- Push notifications for real-time updates

### 3. Admin Controls
- View pending businesses
- Approve/reject businesses
- View approval history
- Track approval metrics

## API Endpoints

### Business Registration
```
POST /api/bussiness/registerBuss
```
- Creates business with "pending" status
- Sends notification to all admins
- Business remains inactive until approved

### Admin Endpoints (Require Admin Role)

#### Get Pending Businesses
```
GET /api/bussiness/admin/pending
```
- Returns all businesses awaiting approval
- Includes owner, category, and submission details

#### Approve Business
```
PUT /api/bussiness/admin/approve/:id
```
- Approves a pending business
- Sets business as active
- Sends notification to business owner

#### Reject Business
```
PUT /api/bussiness/admin/reject/:id
```
Body:
```json
{
  "rejectionReason": "Reason for rejection"
}
```
- Rejects a pending business
- Sets business as inactive
- Sends notification with rejection reason

#### Get Approval History
```
GET /api/bussiness/admin/history
```
- Returns all approved/rejected businesses
- Includes approval details and timestamps

### Notification Endpoints

#### Get User Notifications
```
GET /api/notifications
```
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `unreadOnly`: Show only unread (default: false)

#### Mark Notification as Read
```
PUT /api/notifications/:id/read
```

#### Mark All as Read
```
PUT /api/notifications/mark-all-read
```

#### Get Unread Count
```
GET /api/notifications/unread-count
```

#### Delete Notification
```
DELETE /api/notifications/:id
```

## Database Schema Changes

### Business Model Updates
```javascript
{
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  submittedAt: { type: Date, default: Date.now }
}
```

### Notification Model
```javascript
{
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['business_approval', 'business_rejection', 'general'], 
    required: true 
  },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  data: { type: mongoose.Schema.Types.Mixed }
}
```

## Workflow

### 1. Business Registration
1. User submits business registration
2. Business is created with `approvalStatus: 'pending'`
3. Business is set as inactive (`isActive: false`)
4. Notifications sent to all admin users
5. Push notifications sent to admins with subscriptions

### 2. Admin Review
1. Admin views pending businesses via `/admin/pending`
2. Admin can approve or reject with reason
3. System updates business status
4. Notification sent to business owner
5. Push notification sent to owner

### 3. Business Owner Experience
1. Owner receives notification of status change
2. Can view business status in "My Businesses"
3. Approved businesses become visible to public
4. Rejected businesses can be resubmitted after corrections

## Security Features

### Role-Based Access
- Admin endpoints require `admin` role
- Authentication middleware validates user tokens
- Authorization middleware checks user roles

### Data Protection
- Business data is only visible to owners and admins
- Pending businesses are hidden from public view
- Rejection reasons are only visible to business owners

## Error Handling

### Common Error Responses
- `400`: Invalid request data
- `401`: Unauthorized access
- `403`: Insufficient permissions
- `404`: Resource not found
- `500`: Server error

### Validation
- Rejection requires reason
- Only pending businesses can be approved/rejected
- Admin role required for approval actions

## Push Notifications

### Admin Notifications
- New business submission alerts
- Real-time updates via Web Push API

### Business Owner Notifications
- Approval confirmations
- Rejection notifications with reasons
- Status change alerts

## Usage Examples

### Register New Business
```javascript
const response = await fetch('/api/bussiness/registerBuss', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    name: 'My Business',
    category: 'categoryId',
    subCategory: 'subCategoryId',
    description: 'Business description',
    // ... other business fields
  })
});
```

### Admin Approve Business
```javascript
const response = await fetch('/api/bussiness/admin/approve/businessId', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + adminToken
  }
});
```

### Admin Reject Business
```javascript
const response = await fetch('/api/bussiness/admin/reject/businessId', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + adminToken
  },
  body: JSON.stringify({
    rejectionReason: 'Incomplete business information'
  })
});
```

## Monitoring and Analytics

### Admin Dashboard Metrics
- Total pending businesses
- Approval/rejection rates
- Average approval time
- Business submission trends

### Business Owner Metrics
- Approval status tracking
- Submission history
- Rejection reason analysis

This system ensures quality control while providing transparency and real-time communication between admins and business owners.
