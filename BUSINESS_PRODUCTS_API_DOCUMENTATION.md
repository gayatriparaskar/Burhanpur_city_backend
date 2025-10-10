# Business Products API Documentation

This document explains how to get products for a particular business using the new API endpoints.

## 🎯 **New Endpoints**

### 1. Get Products by Business ID (Public)
- **Endpoint**: `GET /api/product/business/:businessId`
- **Description**: Get all approved and active products for a specific business
- **Authentication**: Not required
- **Returns**: Only approved and active products

### 2. Get My Business Products (Private)
- **Endpoint**: `GET /api/product/my-business/:businessId`
- **Description**: Get all products for a specific business (for business owner)
- **Authentication**: Required
- **Returns**: All products regardless of approval status

## 📋 **API Usage Examples**

### **1. Get Public Business Products**

#### Basic Request
```http
GET /api/product/business/64a1b2c3d4e5f6789012348
```

#### With Query Parameters
```http
GET /api/product/business/64a1b2c3d4e5f6789012348?page=1&limit=10&search=gold&status=active
```

#### Query Parameters Available:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Product status - 'active', 'inactive', 'blocked' (default: 'active')
- `approvalStatus` (string): Approval status - 'approved', 'pending', 'rejected' (default: 'approved')
- `search` (string): Search in name, description, brand, speciality, keywords
- `sortBy` (string): Sort field - 'createdAt', 'name', 'price' (default: 'createdAt')
- `sortOrder` (string): Sort order - 'asc', 'desc' (default: 'desc')

### **2. Get My Business Products (Authenticated)**

#### Basic Request
```http
GET /api/product/my-business/64a1b2c3d4e5f6789012348
Authorization: Bearer YOUR_JWT_TOKEN
```

#### With Query Parameters
```http
GET /api/product/my-business/64a1b2c3d4e5f6789012348?page=1&limit=10&approvalStatus=pending&search=ring
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📝 **Response Format**

### **Success Response (200)**
```json
{
  "success": true,
  "message": "Business products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "64a1b2c3d4e5f6789012349",
        "name": "Gold Ring",
        "description": "Beautiful gold ring",
        "price": 15000,
        "offerPrice": 12000,
        "brand": "GoldSmith",
        "image": [
          "uploads/images/products/product-1234567890-123456789.jpg",
          "uploads/images/products/product-1234567890-123456790.jpg"
        ],
        "inStock": true,
        "quantity": "5",
        "speciality": "Handcrafted",
        "keyWord": ["gold", "ring", "jewelry"],
        "rating": 4.5,
        "approvalStatus": "approved",
        "isActive": true,
        "status": "active",
        "bussinessId": {
          "_id": "64a1b2c3d4e5f6789012348",
          "name": "Gold Jewelry Store",
          "owner": "64a1b2c3d4e5f6789012347"
        },
        "approvedBy": {
          "_id": "64a1b2c3d4e5f6789012346",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "business": {
      "_id": "64a1b2c3d4e5f6789012348",
      "name": "Gold Jewelry Store",
      "owner": "64a1b2c3d4e5f6789012347",
      "description": "Premium gold jewelry store"
    },
    "pagination": {
      "totalPages": 3,
      "currentPage": 1,
      "total": 25,
      "limit": 10
    },
    "filters": {
      "status": "active",
      "approvalStatus": "approved",
      "search": "gold"
    }
  }
}
```

### **Error Response (400/404/500)**
```json
{
  "success": false,
  "message": "Business ID is required",
  "error": "Validation error"
}
```

## 🧪 **Testing with Postman**

### **Test 1: Get Public Business Products**
1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/product/business/YOUR_BUSINESS_ID`
3. **Headers**: None required
4. **Query Parameters** (optional):
   ```
   page: 1
   limit: 10
   search: gold
   status: active
   sortBy: createdAt
   sortOrder: desc
   ```

### **Test 2: Get My Business Products**
1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/product/my-business/YOUR_BUSINESS_ID`
3. **Headers**:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```
4. **Query Parameters** (optional):
   ```
   page: 1
   limit: 10
   approvalStatus: pending
   search: ring
   status: active
   ```

## 🔧 **Frontend Implementation Examples**

### **React Example**
```jsx
import React, { useState, useEffect } from 'react';

const BusinessProducts = ({ businessId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchBusinessProducts();
  }, [businessId]);

  const fetchBusinessProducts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/product/business/${businessId}?page=${page}&limit=10&search=${search}`
      );
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    return `http://localhost:5000/${imagePath}`;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Business Products</h2>
      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            {product.image && product.image.length > 0 && (
              <img 
                src={getImageUrl(product.image[0])} 
                alt={product.name}
                className="product-image"
              />
            )}
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="price">₹{product.price}</p>
            {product.offerPrice && (
              <p className="offer-price">Offer: ₹{product.offerPrice}</p>
            )}
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: pagination.totalPages }, (_, i) => (
          <button 
            key={i + 1}
            onClick={() => fetchBusinessProducts(i + 1)}
            className={pagination.currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BusinessProducts;
```

### **JavaScript Fetch Example**
```javascript
// Get public business products
const getBusinessProducts = async (businessId, page = 1, search = '') => {
  try {
    const response = await fetch(
      `/api/product/business/${businessId}?page=${page}&limit=10&search=${search}`
    );
    const data = await response.json();
    
    if (data.success) {
      console.log('Products:', data.data.products);
      console.log('Pagination:', data.data.pagination);
      return data.data;
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Get my business products (authenticated)
const getMyBusinessProducts = async (businessId, token, page = 1) => {
  try {
    const response = await fetch(
      `/api/product/my-business/${businessId}?page=${page}&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
getBusinessProducts('64a1b2c3d4e5f6789012348', 1, 'gold');
```

## 🎯 **Use Cases**

### **1. Public Business Profile Page**
- Use `/api/product/business/:businessId` to show approved products
- Perfect for customers browsing business products

### **2. Business Owner Dashboard**
- Use `/api/product/my-business/:businessId` to show all products
- Includes pending/rejected products for management

### **3. Product Search & Filtering**
- Use query parameters for search and filtering
- Implement pagination for better performance

### **4. Mobile App Integration**
- Both endpoints work perfectly for mobile apps
- Supports pagination and search functionality

## 🔍 **Advanced Query Examples**

### **Search Products by Name**
```
GET /api/product/business/64a1b2c3d4e5f6789012348?search=ring
```

### **Get Pending Products for Business Owner**
```
GET /api/product/my-business/64a1b2c3d4e5f6789012348?approvalStatus=pending
```

### **Get Products Sorted by Price**
```
GET /api/product/business/64a1b2c3d4e5f6789012348?sortBy=price&sortOrder=asc
```

### **Get Inactive Products**
```
GET /api/product/my-business/64a1b2c3d4e5f6789012348?status=inactive
```

## ⚠️ **Important Notes**

1. **Public endpoint** only returns approved and active products
2. **Private endpoint** requires authentication and returns all products
3. **Image URLs** need to be constructed with the base server URL
4. **Pagination** is recommended for better performance
5. **Search** works across name, description, brand, speciality, and keywords
6. **Sorting** is available on multiple fields

## 🚀 **Quick Start**

1. **Test the public endpoint** first (no authentication needed)
2. **Get a business ID** from your database
3. **Use the endpoint** in your frontend application
4. **Implement pagination** for better user experience
5. **Add search functionality** for product discovery

The API is now ready to use! 🎉
