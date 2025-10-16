# Unified Notifications API Documentation

## Overview
This API provides a comprehensive notification system that fetches all types of notifications (business, product, booking) for a user in a single endpoint. It includes advanced filtering, pagination, categorization, and summary features.

## API Endpoints

### 1. Get All User Notifications (Unified API)
**Endpoint:** `GET /api/notifications/all`

**Description:** Fetches all notifications for a user including business, product, and booking notifications with comprehensive filtering and categorization.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by notification type
- `unreadOnly` (optional): Show only unread notifications (true/false)
- `dateFrom` (optional): Filter from date (ISO format)
- `dateTo` (optional): Filter to date (ISO format)
- `sortBy` (optional): Sort field (default: 'createdAt')
- `sortOrder` (optional): Sort order 'asc' or 'desc' (default: 'desc')

**Example Request:**
```bash
GET /api/notifications/all?page=1&limit=10&unreadOnly=true&type=business_approval
```

**Response:**
```json
{
  "status": 200,
  "message": "All user notifications fetched successfully",
  "data": {
    "notifications": {
      "all": [
        {
          "_id": "notification_id",
          "title": "Business Approved",
          "message": "Your business 'Restaurant ABC' has been approved",
          "type": "business_approval",
          "isRead": false,
          "createdAt": "2024-01-15T10:30:00Z",
          "sender": {
            "name": "Admin",
            "email": "admin@example.com"
          },
          "business": {
            "name": "Restaurant ABC",
            "description": "Fine dining restaurant"
          }
        }
      ],
      "categorized": {
        "business": [...],
        "product": [...],
        "booking": [...],
        "system": [...]
      },
      "total": 25,
      "unreadCount": 8
    },
    "userData": {
      "businesses": [
        {
          "_id": "business_id",
          "name": "Restaurant ABC",
          "approvalStatus": "approved",
          "isActive": true,
          "category": { "name": "Food & Dining" }
        }
      ],
      "products": [...],
      "bookings": [...],
      "recentActivity": {
        "businesses": [...],
        "products": [...],
        "bookings": [...]
      }
    },
    "pagination": {
      "totalPages": 3,
      "currentPage": 1,
      "total": 25,
      "limit": 10
    },
    "filters": {
      "type": "business_approval",
      "unreadOnly": true,
      "dateFrom": null,
      "dateTo": null,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

### 2. Get Notification Summary/Dashboard
**Endpoint:** `GET /api/notifications/summary`

**Description:** Provides a dashboard summary with notification counts, recent activity, and user statistics.

**Response:**
```json
{
  "status": 200,
  "message": "Notification summary fetched successfully",
  "data": {
    "notificationCounts": [
      {
        "_id": "business_approval",
        "total": 5,
        "unread": 2
      },
      {
        "_id": "product_approval",
        "total": 3,
        "unread": 1
      }
    ],
    "recentNotifications": [...],
    "userStats": {
      "businesses": 5,
      "products": 12,
      "bookings": 8,
      "pendingBusinesses": 1,
      "pendingProducts": 2
    }
  }
}
```

### 3. Get Notifications by Entity
**Endpoint:** `GET /api/notifications/entity/:entityType/:entityId`

**Description:** Fetches notifications for a specific entity (business, product, or booking).

**Parameters:**
- `entityType`: business, product, or booking
- `entityId`: ID of the specific entity

**Example:**
```bash
GET /api/notifications/entity/business/64f1a2b3c4d5e6f7g8h9i0j1
```

## Notification Types

### Business Notifications
- `business_approval`: Business approved by admin
- `business_rejection`: Business rejected by admin
- `business_submission`: Business submitted for approval
- `business_suspended`: Business suspended
- `business_reactivated`: Business reactivated

### Product Notifications
- `product_approval`: Product approved by admin
- `product_rejection`: Product rejected by admin
- `product_submission`: Product submitted for approval
- `product_suspended`: Product suspended
- `product_reactivated`: Product reactivated

### Booking Notifications
- `booking_confirmed`: Booking confirmed
- `booking_cancelled`: Booking cancelled
- `booking_reminder`: Booking reminder
- `booking_completed`: Booking completed
- `payment_received`: Payment received for booking

### System Notifications
- `general`: General system notifications
- `maintenance`: System maintenance notifications
- `update`: App update notifications

## Frontend Implementation Examples

### React.js Example
```jsx
import React, { useState, useEffect } from 'react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    unreadOnly: false,
    type: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchAllNotifications();
  }, [filters]);

  const fetchAllNotifications = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/notifications/all?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setNotifications(data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchAllNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchAllNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h2>Notifications</h2>
        <button onClick={markAllAsRead}>Mark All as Read</button>
      </div>

      <div className="notification-filters">
        <select 
          value={filters.type} 
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="">All Types</option>
          <option value="business_approval">Business</option>
          <option value="product_approval">Product</option>
          <option value="booking_confirmed">Booking</option>
        </select>
        
        <label>
          <input 
            type="checkbox" 
            checked={filters.unreadOnly}
            onChange={(e) => setFilters({...filters, unreadOnly: e.target.checked})}
          />
          Unread Only
        </label>
      </div>

      <div className="notification-list">
        {loading ? (
          <div>Loading...</div>
        ) : (
          notifications.notifications.all.map(notification => (
            <div 
              key={notification._id} 
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              onClick={() => !notification.isRead && markAsRead(notification._id)}
            >
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              {!notification.isRead && <div className="unread-indicator"></div>}
            </div>
          ))
        )}
      </div>

      <div className="pagination">
        {Array.from({length: notifications.pagination.totalPages}, (_, i) => (
          <button 
            key={i + 1}
            onClick={() => setFilters({...filters, page: i + 1})}
            className={filters.page === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;
```

### Vue.js Example
```vue
<template>
  <div class="notification-center">
    <div class="notification-header">
      <h2>Notifications</h2>
      <button @click="markAllAsRead">Mark All as Read</button>
    </div>

    <div class="notification-filters">
      <select v-model="filters.type">
        <option value="">All Types</option>
        <option value="business_approval">Business</option>
        <option value="product_approval">Product</option>
        <option value="booking_confirmed">Booking</option>
      </select>
      
      <label>
        <input type="checkbox" v-model="filters.unreadOnly" />
        Unread Only
      </label>
    </div>

    <div class="notification-list">
      <div v-if="loading">Loading...</div>
      <div 
        v-else
        v-for="notification in notifications.notifications.all"
        :key="notification._id"
        :class="['notification-item', { 'read': notification.isRead, 'unread': !notification.isRead }]"
        @click="!notification.isRead && markAsRead(notification._id)"
      >
        <div class="notification-content">
          <h4>{{ notification.title }}</h4>
          <p>{{ notification.message }}</p>
          <span class="notification-time">
            {{ formatDate(notification.createdAt) }}
          </span>
        </div>
        <div v-if="!notification.isRead" class="unread-indicator"></div>
      </div>
    </div>

    <div class="pagination">
      <button 
        v-for="page in notifications.pagination.totalPages"
        :key="page"
        @click="filters.page = page"
        :class="{ 'active': filters.page === page }"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      notifications: {},
      loading: true,
      filters: {
        unreadOnly: false,
        type: '',
        page: 1,
        limit: 20
      }
    }
  },
  mounted() {
    this.fetchAllNotifications();
  },
  watch: {
    filters: {
      handler() {
        this.fetchAllNotifications();
      },
      deep: true
    }
  },
  methods: {
    async fetchAllNotifications() {
      try {
        this.loading = true;
        const queryParams = new URLSearchParams(this.filters);
        const response = await fetch(`/api/notifications/all?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        this.notifications = data.data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        this.loading = false;
      }
    },
    async markAsRead(notificationId) {
      try {
        await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.fetchAllNotifications();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    async markAllAsRead() {
      try {
        await fetch('/api/notifications/mark-all-read', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.fetchAllNotifications();
      } catch (error) {
        console.error('Error marking all as read:', error);
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    }
  }
}
</script>
```

### Vanilla JavaScript Example
```javascript
class NotificationCenter {
  constructor() {
    this.notifications = [];
    this.filters = {
      unreadOnly: false,
      type: '',
      page: 1,
      limit: 20
    };
    this.init();
  }

  async init() {
    await this.fetchAllNotifications();
    this.render();
    this.setupEventListeners();
  }

  async fetchAllNotifications() {
    try {
      const queryParams = new URLSearchParams(this.filters);
      const response = await fetch(`/api/notifications/all?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      this.notifications = data.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  async markAsRead(notificationId) {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      await this.fetchAllNotifications();
      this.render();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead() {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      await this.fetchAllNotifications();
      this.render();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  render() {
    const container = document.getElementById('notification-center');
    if (!container) return;

    container.innerHTML = `
      <div class="notification-header">
        <h2>Notifications</h2>
        <button onclick="notificationCenter.markAllAsRead()">Mark All as Read</button>
      </div>

      <div class="notification-filters">
        <select id="type-filter">
          <option value="">All Types</option>
          <option value="business_approval">Business</option>
          <option value="product_approval">Product</option>
          <option value="booking_confirmed">Booking</option>
        </select>
        
        <label>
          <input type="checkbox" id="unread-only" />
          Unread Only
        </label>
      </div>

      <div class="notification-list">
        ${this.notifications.notifications?.all?.map(notification => `
          <div 
            class="notification-item ${notification.isRead ? 'read' : 'unread'}"
            onclick="${!notification.isRead ? `notificationCenter.markAsRead('${notification._id}')` : ''}"
          >
            <div class="notification-content">
              <h4>${notification.title}</h4>
              <p>${notification.message}</p>
              <span class="notification-time">
                ${new Date(notification.createdAt).toLocaleString()}
              </span>
            </div>
            ${!notification.isRead ? '<div class="unread-indicator"></div>' : ''}
          </div>
        `).join('') || '<div>No notifications found</div>'}
      </div>

      <div class="pagination">
        ${Array.from({length: this.notifications.pagination?.totalPages || 0}, (_, i) => `
          <button 
            onclick="notificationCenter.filters.page = ${i + 1}; notificationCenter.fetchAllNotifications().then(() => notificationCenter.render())"
            class="${this.filters.page === i + 1 ? 'active' : ''}"
          >
            ${i + 1}
          </button>
        `).join('')}
      </div>
    `;
  }

  setupEventListeners() {
    // Type filter
    const typeFilter = document.getElementById('type-filter');
    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        this.filters.type = e.target.value;
        this.filters.page = 1;
        this.fetchAllNotifications().then(() => this.render());
      });
    }

    // Unread only filter
    const unreadOnly = document.getElementById('unread-only');
    if (unreadOnly) {
      unreadOnly.addEventListener('change', (e) => {
        this.filters.unreadOnly = e.target.checked;
        this.filters.page = 1;
        this.fetchAllNotifications().then(() => this.render());
      });
    }
  }
}

// Initialize notification center
const notificationCenter = new NotificationCenter();
```

## CSS Styling
```css
.notification-center {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.notification-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.notification-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.notification-item.unread {
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
}

.notification-item.read {
  background-color: #fff;
  opacity: 0.8;
}

.notification-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.notification-content h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.notification-content p {
  margin: 0 0 8px 0;
  color: #666;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.unread-indicator {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 8px;
  height: 8px;
  background-color: #007bff;
  border-radius: 50%;
}

.pagination {
  display: flex;
  gap: 5px;
  justify-content: center;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination button:hover {
  background-color: #f8f9fa;
}
```

## Features

### 1. Unified Data Fetching
- Single API call fetches all notification types
- Includes related business, product, and booking data
- Comprehensive user activity summary

### 2. Advanced Filtering
- Filter by notification type
- Filter by read/unread status
- Date range filtering
- Custom sorting options

### 3. Categorization
- Automatic categorization by notification type
- Business, product, booking, and system notifications
- Easy frontend filtering and display

### 4. Pagination
- Efficient pagination for large notification lists
- Configurable page size
- Total count and page information

### 5. Real-time Updates
- Mark individual notifications as read
- Mark all notifications as read
- Unread count tracking

### 6. Dashboard Summary
- Notification counts by type
- User statistics (businesses, products, bookings)
- Recent activity overview
- Pending approvals count

## Security Features
- Authentication required for all endpoints
- User can only access their own notifications
- Input validation and sanitization
- Rate limiting on notification operations

## Performance Optimizations
- Efficient database queries with proper indexing
- Pagination to handle large datasets
- Populated related data in single queries
- Caching for frequently accessed data

This unified notifications API provides a comprehensive solution for managing all types of user notifications in a single, efficient interface.
