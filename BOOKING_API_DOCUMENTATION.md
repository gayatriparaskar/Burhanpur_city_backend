# Updated Booking API Documentation

The booking model has been updated to include `business_id` and `product_id` fields for better tracking and management.

## Updated Booking Model

```javascript
{
  booking_id: String,           // Auto-generated unique ID (BK_xxxxx)
  user_id: ObjectId,           // Reference to User who made the booking
  business_id: ObjectId,       // Reference to Business (NEW)
  product_id: ObjectId,        // Reference to Product (NEW)
  type: String,                // hotel, doctor, travel, cab, event, hall, service
  booking_date: Date,          // When booking was made
  scheduled_date: Date,        // When the service is scheduled
  start_time: Date,
  end_time: Date,
  location: String,
  amount: Number,
  payment_status: String,      // pending, paid, failed, refunded
  payment_method: String,
  transaction_id: String,
  status: String,              // pending, confirmed, cancelled, completed
  guest_count: Number,
  seat_number: String,
  doctor_id: String,
  vehicle_type: String,
  extra_details: Object
}
```

## API Endpoints

### 1. Create Booking
**POST** `/api/bookings`

Creates a new booking with business and product references.

**Request Body:**
```json
{
  "user_id": "64a1b2c3d4e5f6789012345",
  "business_id": "64a1b2c3d4e5f6789012346",
  "product_id": "64a1b2c3d4e5f6789012347",
  "type": "hotel",
  "scheduled_date": "2024-01-20T10:00:00.000Z",
  "start_time": "2024-01-20T10:00:00.000Z",
  "end_time": "2024-01-22T12:00:00.000Z",
  "location": "Hotel ABC, Mumbai",
  "amount": 5000,
  "payment_method": "UPI",
  "guest_count": 2,
  "extra_details": {
    "room_type": "Deluxe",
    "special_requests": "Non-smoking room"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created",
  "data": {
    "_id": "64a1b2c3d4e5f6789012348",
    "booking_id": "BK_12345678-1234-1234-1234-123456789012",
    "user_id": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91-9876543210"
    },
    "business_id": {
      "_id": "64a1b2c3d4e5f6789012346",
      "businessName": "Hotel ABC",
      "email": "info@hotelabc.com",
      "phone": "+91-9876543211",
      "address": "Mumbai, India"
    },
    "product_id": {
      "_id": "64a1b2c3d4e5f6789012347",
      "name": "Deluxe Room Package",
      "price": 5000,
      "description": "2 nights stay with breakfast"
    },
    "type": "hotel",
    "booking_date": "2024-01-15T10:30:00.000Z",
    "scheduled_date": "2024-01-20T10:00:00.000Z",
    "start_time": "2024-01-20T10:00:00.000Z",
    "end_time": "2024-01-22T12:00:00.000Z",
    "location": "Hotel ABC, Mumbai",
    "amount": 5000,
    "payment_status": "pending",
    "status": "pending",
    "guest_count": 2,
    "extra_details": {
      "room_type": "Deluxe",
      "special_requests": "Non-smoking room"
    }
  }
}
```

### 2. Get All Bookings (with filters)
**GET** `/api/bookings`

Retrieves all bookings with optional filters.

**Query Parameters:**
- `status` - Filter by booking status (pending, confirmed, cancelled, completed)
- `payment_status` - Filter by payment status (pending, paid, failed, refunded)
- `type` - Filter by booking type (hotel, doctor, travel, cab, event, hall, service)
- `business_id` - Filter by business ID
- `product_id` - Filter by product ID

**Example:**
```
GET /api/bookings?status=confirmed&type=hotel&business_id=64a1b2c3d4e5f6789012346
```

### 3. Get Booking by ID
**GET** `/api/bookings/get/:id`

Retrieves a specific booking by its ID.

### 4. Get Bookings by User
**GET** `/api/bookings/user/:userId`

Retrieves all bookings for a specific user.

### 5. Get Bookings by Business
**GET** `/api/bookings/business/:businessId`

Retrieves all bookings for a specific business.

### 6. Get Bookings by Product
**GET** `/api/bookings/product/:productId`

Retrieves all bookings for a specific product.

### 7. Update Booking
**PUT** `/api/bookings/:id`

Updates a booking (status, payment, etc.).

**Request Body:**
```json
{
  "status": "confirmed",
  "payment_status": "paid",
  "transaction_id": "TXN_123456789"
}
```

### 8. Delete Booking
**DELETE** `/api/bookings/:id`

Deletes a booking.

## Key Features

### ✅ **Validation**
- Validates that `business_id` and `product_id` exist before creating booking
- Ensures all required fields are provided
- Returns appropriate error messages for missing or invalid data

### ✅ **Population**
- All GET endpoints automatically populate business, product, and user details
- Returns complete information instead of just IDs

### ✅ **Filtering**
- Support for filtering by status, payment status, type, business, and product
- Useful for business dashboards and analytics

### ✅ **Business Intelligence**
- Easy to track which products are most booked
- Business performance analytics
- User booking history

## Example Use Cases

### 1. **Business Dashboard**
```javascript
// Get all bookings for a business
GET /api/bookings/business/64a1b2c3d4e5f6789012346

// Get confirmed bookings for a business
GET /api/bookings/business/64a1b2c3d4e5f6789012346?status=confirmed
```

### 2. **Product Analytics**
```javascript
// Get all bookings for a product
GET /api/bookings/product/64a1b2c3d4e5f6789012347

// Get paid bookings for a product
GET /api/bookings/product/64a1b2c3d4e5f6789012347?payment_status=paid
```

### 3. **User Booking History**
```javascript
// Get all bookings for a user
GET /api/bookings/user/64a1b2c3d4e5f6789012345

// Get completed bookings for a user
GET /api/bookings/user/64a1b2c3d4e5f6789012345?status=completed
```

## Error Responses

```json
{
  "success": false,
  "message": "Business not found"
}
```

```json
{
  "success": false,
  "message": "business_id, product_id, user_id, and type are required"
}
```

## Migration Notes

If you have existing bookings without `business_id` and `product_id`, you'll need to:

1. **Update existing bookings** with appropriate business and product IDs
2. **Make the fields optional temporarily** during migration
3. **Add validation** to ensure new bookings always include these fields

## Database Relationships

```
User (1) -----> (Many) Booking (Many) <----- (1) Business
                      |
                      v
                   Product (1)
```

This structure allows for:
- **User**: Can see all their bookings across different businesses
- **Business**: Can see all bookings for their products
- **Product**: Can track booking performance and analytics
