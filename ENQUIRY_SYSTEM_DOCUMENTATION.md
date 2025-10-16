# Enquiry System Documentation

## Overview
The Enquiry System allows users to submit enquiries/requests for specific categories and subcategories. All businesses related to those categories/subcategories will receive notifications about the enquiry and can respond directly to the user.

## System Flow

1. **User submits enquiry** → Targets specific category/subcategory
2. **System finds all businesses** → Related to that category/subcategory
3. **Notifications sent** → To all relevant business owners
4. **Business owners respond** → Directly to the enquiry submitter
5. **User receives responses** → Via notifications

## API Endpoints

### 1. Submit Enquiry
**Endpoint:** `POST /api/enquiries/submit`

**Description:** Submit a new enquiry for a specific category/subcategory.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Need Catering Services for Wedding",
  "description": "Looking for professional catering services for a wedding with 200 guests. Need vegetarian and non-vegetarian options.",
  "category": "64f1a2b3c4d5e6f7g8h9i0j1",
  "subCategory": "64f1a2b3c4d5e6f7g8h9i0j2",
  "type": "service_inquiry",
  "priority": "high",
  "preferredContactMethod": "whatsapp",
  "budgetRange": {
    "min": 50000,
    "max": 100000
  },
  "expectedTimeline": "within_month",
  "location": {
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "tags": ["wedding", "catering", "vegetarian"]
}
```

**Response:**
```json
{
  "status": 201,
  "message": "Enquiry submitted successfully",
  "data": {
    "enquiry": {
      "_id": "enquiry_id",
      "title": "Need Catering Services for Wedding",
      "description": "Looking for professional catering services...",
      "category": "64f1a2b3c4d5e6f7g8h9i0j1",
      "subCategory": "64f1a2b3c4d5e6f7g8h9i0j2",
      "type": "service_inquiry",
      "priority": "high",
      "status": "active",
      "user": "user_id",
      "createdAt": "2024-01-15T10:30:00Z",
      "expiresAt": "2024-02-14T10:30:00Z"
    },
    "notificationsSent": 5,
    "targetBusinesses": [
      {
        "id": "business_id_1",
        "name": "Royal Caterers",
        "owner": "John Doe"
      },
      {
        "id": "business_id_2", 
        "name": "Delicious Foods",
        "owner": "Jane Smith"
      }
    ]
  }
}
```

### 2. Get Business Enquiries
**Endpoint:** `GET /api/enquiries/business`

**Description:** Get enquiries targeting business owner's categories/subcategories.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (active, completed, cancelled, expired)
- `type` (optional): Filter by enquiry type
- `priority` (optional): Filter by priority

**Example:**
```bash
GET /api/enquiries/business?status=active&priority=high&page=1&limit=10
```

**Response:**
```json
{
  "status": 200,
  "message": "Business enquiries fetched successfully",
  "data": {
    "enquiries": [
      {
        "_id": "enquiry_id",
        "title": "Need Catering Services for Wedding",
        "description": "Looking for professional catering services...",
        "type": "service_inquiry",
        "priority": "high",
        "status": "active",
        "user": {
          "name": "Alice Johnson",
          "email": "alice@example.com",
          "phone": "+91-9876543210"
        },
        "category": {
          "name": "Food & Dining"
        },
        "subCategory": {
          "name": "Catering Services"
        },
        "budgetRange": {
          "min": 50000,
          "max": 100000
        },
        "expectedTimeline": "within_month",
        "location": {
          "city": "Mumbai",
          "state": "Maharashtra"
        },
        "responseCount": 0,
        "viewCount": 0,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "totalPages": 3,
      "currentPage": 1,
      "total": 25,
      "limit": 10
    }
  }
}
```

### 3. Respond to Enquiry
**Endpoint:** `POST /api/enquiries/:enquiryId/respond`

**Description:** Respond to a specific enquiry.

**Request Body:**
```json
{
  "message": "Hi! We specialize in wedding catering with both vegetarian and non-vegetarian options. We can provide a detailed quote for 200 guests within your budget range.",
  "contactInfo": {
    "phone": "+91-9876543210",
    "email": "info@royalcaterers.com",
    "whatsapp": "+91-9876543210"
  }
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Response submitted successfully",
  "data": {
    "enquiry": {
      "_id": "enquiry_id",
      "responses": [
        {
          "business": "business_id",
          "message": "Hi! We specialize in wedding catering...",
          "contactInfo": {
            "phone": "+91-9876543210",
            "email": "info@royalcaterers.com",
            "whatsapp": "+91-9876543210"
          },
          "respondedAt": "2024-01-15T11:00:00Z"
        }
      ]
    },
    "response": {
      "business": "Royal Caterers",
      "message": "Hi! We specialize in wedding catering...",
      "contactInfo": {
        "phone": "+91-9876543210",
        "email": "info@royalcaterers.com",
        "whatsapp": "+91-9876543210"
      },
      "respondedAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

### 4. Get User's Enquiries
**Endpoint:** `GET /api/enquiries/user`

**Description:** Get enquiries submitted by the current user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status

**Response:**
```json
{
  "status": 200,
  "message": "User enquiries fetched successfully",
  "data": {
    "enquiries": [
      {
        "_id": "enquiry_id",
        "title": "Need Catering Services for Wedding",
        "description": "Looking for professional catering services...",
        "type": "service_inquiry",
        "priority": "high",
        "status": "active",
        "category": {
          "name": "Food & Dining"
        },
        "subCategory": {
          "name": "Catering Services"
        },
        "responses": [
          {
            "business": {
              "name": "Royal Caterers",
              "description": "Premium catering services",
              "images": ["image1.jpg", "image2.jpg"]
            },
            "message": "Hi! We specialize in wedding catering...",
            "contactInfo": {
              "phone": "+91-9876543210",
              "email": "info@royalcaterers.com"
            },
            "respondedAt": "2024-01-15T11:00:00Z"
          }
        ],
        "responseCount": 1,
        "viewCount": 5,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "totalPages": 2,
      "currentPage": 1,
      "total": 15,
      "limit": 10
    }
  }
}
```

### 5. Get Enquiry Details
**Endpoint:** `GET /api/enquiries/:enquiryId`

**Description:** Get detailed information about a specific enquiry.

**Response:**
```json
{
  "status": 200,
  "message": "Enquiry details fetched successfully",
  "data": {
    "_id": "enquiry_id",
    "title": "Need Catering Services for Wedding",
    "description": "Looking for professional catering services for a wedding with 200 guests...",
    "type": "service_inquiry",
    "priority": "high",
    "status": "active",
    "user": {
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "+91-9876543210"
    },
    "category": {
      "name": "Food & Dining"
    },
    "subCategory": {
      "name": "Catering Services"
    },
    "budgetRange": {
      "min": 50000,
      "max": 100000
    },
    "expectedTimeline": "within_month",
    "location": {
      "address": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "responses": [
      {
        "business": {
          "name": "Royal Caterers",
          "description": "Premium catering services",
          "images": ["image1.jpg", "image2.jpg"],
          "owner": {
            "name": "John Doe",
            "email": "john@royalcaterers.com",
            "phone": "+91-9876543210"
          }
        },
        "message": "Hi! We specialize in wedding catering...",
        "contactInfo": {
          "phone": "+91-9876543210",
          "email": "info@royalcaterers.com",
          "whatsapp": "+91-9876543210"
        },
        "respondedAt": "2024-01-15T11:00:00Z"
      }
    ],
    "responseCount": 1,
    "viewCount": 5,
    "createdAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-02-14T10:30:00Z"
  }
}
```

### 6. Mark Enquiry as Completed
**Endpoint:** `PUT /api/enquiries/:enquiryId/complete`

**Description:** Mark an enquiry as completed (only by enquiry owner).

**Response:**
```json
{
  "status": 200,
  "message": "Enquiry marked as completed",
  "data": {
    "_id": "enquiry_id",
    "status": "completed",
    "title": "Need Catering Services for Wedding",
    "description": "Looking for professional catering services...",
    "completedAt": "2024-01-20T10:30:00Z"
  }
}
```

### 7. Get Enquiry Statistics
**Endpoint:** `GET /api/enquiries/stats/business`

**Description:** Get statistics about enquiries for business owners.

**Response:**
```json
{
  "status": 200,
  "message": "Enquiry statistics fetched successfully",
  "data": {
    "stats": [
      {
        "_id": "active",
        "count": 15
      },
      {
        "_id": "completed",
        "count": 8
      },
      {
        "_id": "expired",
        "count": 3
      }
    ],
    "totalEnquiries": 26,
    "recentEnquiries": [
      {
        "_id": "enquiry_id_1",
        "title": "Need Catering Services",
        "user": {
          "name": "Alice Johnson"
        },
        "category": {
          "name": "Food & Dining"
        },
        "subCategory": {
          "name": "Catering Services"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

## Enquiry Types

### 1. General Enquiry
- Basic questions or information requests
- No specific urgency or timeline

### 2. Quote Request
- Request for pricing information
- Budget range specified
- Timeline for quote needed

### 3. Service Inquiry
- Specific service requirements
- Detailed description of needs
- Contact preferences specified

### 4. Product Inquiry
- Product-specific questions
- Specifications and requirements
- Availability and pricing

### 5. Urgent
- Time-sensitive requests
- Immediate attention needed
- High priority handling

## Priority Levels

- **Low**: Flexible timeline, general information
- **Medium**: Standard timeline, specific requirements
- **High**: Important timeline, detailed requirements
- **Urgent**: Immediate attention, critical timeline

## Timeline Options

- **Immediate**: Within 24 hours
- **Within Week**: 1-7 days
- **Within Month**: 1-4 weeks
- **Flexible**: No specific timeline

## Notification Flow

### 1. Enquiry Submission
- User submits enquiry for category/subcategory
- System finds all businesses in that category/subcategory
- Notifications sent to all relevant business owners
- Notification type: `enquiry_received`

### 2. Business Response
- Business owner responds to enquiry
- Notification sent to enquiry submitter
- Notification type: `enquiry_response`

### 3. Enquiry Completion
- User marks enquiry as completed
- No additional notifications sent

## Security Features

- Authentication required for all endpoints
- Users can only access their own enquiries
- Business owners can only see enquiries for their categories
- Input validation and sanitization
- Rate limiting on enquiry submission

## Performance Optimizations

- Efficient database queries with proper indexing
- Pagination for large datasets
- Cached category/subcategory lookups
- Optimized notification delivery

## Error Handling

- Comprehensive error messages
- Input validation
- Database error handling
- Network error handling
- User-friendly error responses

This enquiry system provides a comprehensive solution for connecting users with relevant businesses through targeted enquiries and notifications.
