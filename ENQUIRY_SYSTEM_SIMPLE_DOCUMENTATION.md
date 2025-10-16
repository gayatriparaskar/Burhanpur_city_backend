# Simple Enquiry System Documentation

## Overview
A simplified enquiry system where users can submit enquiries for specific categories/subcategories, and all relevant businesses receive notifications with user details.

## Model Structure
```javascript
{
  user: ObjectId,           // User who submitted the enquiry
  description: String,      // Enquiry description
  category: ObjectId,       // Category ID for detecting businesses
  subCategory: ObjectId,    // SubCategory ID for detecting businesses
  createdAt: Date,          // Auto-generated timestamp
  updatedAt: Date          // Auto-generated timestamp
}
```

## API Endpoints

### 1. Submit Enquiry
**Endpoint:** `POST /api/enquiries/submit`

**Request Body:**
```json
{
  "description": "Need catering services for wedding with 200 guests",
  "category": "64f1a2b3c4d5e6f7g8h9i0j1",
  "subCategory": "64f1a2b3c4d5e6f7g8h9i0j2"
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
      "user": "user_id",
      "description": "Need catering services for wedding with 200 guests",
      "category": "64f1a2b3c4d5e6f7g8h9i0j1",
      "subCategory": "64f1a2b3c4d5e6f7g8h9i0j2",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "notificationsSent": 5,
    "targetBusinesses": [
      {
        "id": "business_id_1",
        "name": "Royal Caterers",
        "owner": "John Doe"
      }
    ]
  }
}
```

### 2. Get Business Enquiries
**Endpoint:** `GET /api/enquiries/business`

**Response:**
```json
{
  "status": 200,
  "message": "Business enquiries fetched successfully",
  "data": {
    "enquiries": [
      {
        "_id": "enquiry_id",
        "description": "Need catering services for wedding with 200 guests",
        "user": {
          "name": "Alice Johnson",
          "phone": "+91-9876543210"
        },
        "category": {
          "name": "Food & Dining"
        },
        "subCategory": {
          "name": "Catering Services"
        },
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

**Request Body:**
```json
{
  "message": "Hi! We specialize in wedding catering with both vegetarian and non-vegetarian options. We can provide a detailed quote for 200 guests within your budget range.",
  "contactInfo": {
    "phone": "+91-9876543210",
    "email": "info@royalcaterers.com"
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
      "description": "Need catering services for wedding with 200 guests",
      "user": {
        "name": "Alice Johnson",
        "phone": "+91-9876543210"
      }
    },
    "response": {
      "business": "Royal Caterers",
      "message": "Hi! We specialize in wedding catering...",
      "contactInfo": {
        "phone": "+91-9876543210",
        "email": "info@royalcaterers.com"
      },
      "respondedAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

### 4. Get User's Enquiries
**Endpoint:** `GET /api/enquiries/user`

**Response:**
```json
{
  "status": 200,
  "message": "User enquiries fetched successfully",
  "data": {
    "enquiries": [
      {
        "_id": "enquiry_id",
        "description": "Need catering services for wedding with 200 guests",
        "category": {
          "name": "Food & Dining"
        },
        "subCategory": {
          "name": "Catering Services"
        },
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

**Response:**
```json
{
  "status": 200,
  "message": "Enquiry details fetched successfully",
  "data": {
    "_id": "enquiry_id",
    "description": "Need catering services for wedding with 200 guests",
    "user": {
      "name": "Alice Johnson",
      "phone": "+91-9876543210"
    },
    "category": {
      "name": "Food & Dining"
    },
    "subCategory": {
      "name": "Catering Services"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Notification System

### Enquiry Received Notification
When a user submits an enquiry, business owners receive a notification with:
- **Title:** "New Enquiry Received"
- **Message:** "A new enquiry has been submitted for [SubCategory] by [UserName] ([UserPhone]). [Description]..."
- **Data includes:** enquiryId, category, subCategory, userName, userPhone

### Enquiry Response Notification
When a business responds to an enquiry, the enquiry submitter receives a notification with:
- **Title:** "Response to your enquiry"
- **Message:** "Your enquiry has received a response from [BusinessName]. [Response]..."

## System Flow

1. **User submits enquiry** → Only description, category, subCategory required
2. **System finds businesses** → All businesses in that category/subcategory
3. **Notifications sent** → To all relevant business owners with user name and phone
4. **Business owners respond** → Via notification system
5. **User gets responses** → Through notifications

## Key Features

✅ **Simple Model** - Only essential fields (user, description, category, subCategory)  
✅ **User Details** - Shows user name and phone in responses  
✅ **Automatic Targeting** - Finds relevant businesses automatically  
✅ **Notification System** - Integrated with existing notification system  
✅ **Clean API** - Simple endpoints with clear purposes  

## Frontend Usage Examples

### Submit Enquiry (React)
```jsx
const submitEnquiry = async (formData) => {
  try {
    const response = await fetch('/api/enquiries/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: formData.description,
        category: formData.category,
        subCategory: formData.subCategory
      })
    });
    const result = await response.json();
    console.log('Enquiry submitted:', result);
  } catch (error) {
    console.error('Error submitting enquiry:', error);
  }
};
```

### Get Business Enquiries (React)
```jsx
const fetchBusinessEnquiries = async () => {
  try {
    const response = await fetch('/api/enquiries/business', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    setEnquiries(result.data.enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
  }
};
```

### Respond to Enquiry (React)
```jsx
const respondToEnquiry = async (enquiryId, message, contactInfo) => {
  try {
    const response = await fetch(`/api/enquiries/${enquiryId}/respond`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, contactInfo })
    });
    const result = await response.json();
    console.log('Response sent:', result);
  } catch (error) {
    console.error('Error responding to enquiry:', error);
  }
};
```

This simplified enquiry system provides a clean, efficient way for users to submit enquiries and for businesses to receive targeted notifications with user contact details.
