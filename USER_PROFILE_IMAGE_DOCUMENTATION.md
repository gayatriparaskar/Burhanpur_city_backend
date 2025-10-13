# User Profile Image Upload Documentation

This document explains how to use the user profile image upload functionality in the Burhanpur City Backend API.

## 🎯 **Overview**

The user profile image system allows users to upload and manage their profile pictures with the following features:
- Single profile image per user
- Automatic file organization in dedicated directories
- Image validation (only image files allowed)
- File size limit (5MB per file)
- Automatic cleanup of old images when updating
- Proper error handling and validation

## 📁 **Directory Structure**

```
uploads/
├── images/
│   ├── businesses/     # Business images
│   ├── products/      # Product images
│   ├── advertisements/ # Advertisement images
│   └── users/         # User profile images
└── temp/              # Temporary files
```

## 🔧 **API Endpoints**

### **1. Create User with Profile Image**
- **Endpoint**: `POST /api/Users/createUser`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Not required
- **Fields**:
  - `name`: User's full name
  - `email`: User's email address
  - `password`: User's password
  - `phone`: User's phone number (10 digits)
  - `address`: User's address (optional)
  - `profileImage`: Profile image file (optional)

### **2. Update User with Profile Image**
- **Endpoint**: `PUT /api/Users/updatedUser/:id`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Not required (but recommended)
- **Fields**:
  - `name`: Updated name (optional)
  - `email`: Updated email (optional)
  - `phone`: Updated phone (optional)
  - `address`: Updated address (optional)
  - `profileImage`: New profile image file (optional)

### **3. Upload Profile Image Only**
- **Endpoint**: `POST /api/Users/upload-profile-image/:id`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Required
- **Headers**: `Authorization: Bearer <token>`
- **Fields**:
  - `profileImage`: Profile image file

## 📝 **Request Examples**

### **Using Postman**

#### **Create User with Profile Image**
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/Users/createUser`
3. **Body Type**: `form-data`
4. **Fields**:
   ```
   name: "John Doe"
   email: "john@example.com"
   password: "password123"
   phone: "9876543210"
   address: "123 Main Street, City"
   profileImage: [Select image file]
   ```

#### **Update User with Profile Image**
1. **Method**: `PUT`
2. **URL**: `http://localhost:5000/api/Users/updatedUser/USER_ID`
3. **Body Type**: `form-data`
4. **Fields**:
   ```
   name: "John Smith"
   address: "456 New Street, City"
   profileImage: [Select new image file]
   ```

#### **Upload Profile Image Only**
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/Users/upload-profile-image/USER_ID`
3. **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
4. **Body Type**: `form-data`
5. **Fields**:
   ```
   profileImage: [Select image file]
   ```

### **Using cURL**

#### **Create User with Profile Image**
```bash
curl -X POST http://localhost:5000/api/Users/createUser \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "password=password123" \
  -F "phone=9876543210" \
  -F "address=123 Main Street" \
  -F "profileImage=@/path/to/profile.jpg"
```

#### **Upload Profile Image Only**
```bash
curl -X POST http://localhost:5000/api/Users/upload-profile-image/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profileImage=@/path/to/profile.jpg"
```

### **Using JavaScript/Fetch**

#### **Create User with Profile Image**
```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('password', 'password123');
formData.append('phone', '9876543210');
formData.append('address', '123 Main Street');
formData.append('profileImage', fileInput.files[0]);

fetch('/api/Users/createUser', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

#### **Upload Profile Image Only**
```javascript
const formData = new FormData();
formData.append('profileImage', fileInput.files[0]);

fetch(`/api/Users/upload-profile-image/${userId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## 📋 **Response Format**

### **Success Response (200/201)**
```json
{
  "success": true,
  "message": "User is created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012349",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "address": "123 Main Street",
    "profileImage": "uploads/images/users/user-1234567890-123456789.jpg",
    "role": "user",
    "status": "active",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **Profile Image Upload Success**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "data": {
    "userId": "64a1b2c3d4e5f6789012349",
    "profileImage": "uploads/images/users/user-1234567890-123456789.jpg"
  }
}
```

### **Error Response (400/500)**
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB.",
  "error": "LIMIT_FILE_SIZE"
}
```

## 🔍 **Frontend Implementation Examples**

### **React Example**
```jsx
import React, { useState } from 'react';

const UserProfile = ({ user, token }) => {
  const [profileImage, setProfileImage] = useState(user.profileImage);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await fetch(`/api/Users/upload-profile-image/${user._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setProfileImage(data.data.profileImage);
        alert('Profile image updated successfully!');
      } else {
        alert('Error uploading image: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error uploading image');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-avatar.png';
    return `http://localhost:5000/${imagePath}`;
  };

  return (
    <div className="user-profile">
      <div className="profile-image-container">
        <img 
          src={getImageUrl(profileImage)} 
          alt="Profile" 
          className="profile-image"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={loading}
          style={{ display: 'none' }}
          id="profile-image-input"
        />
        <label htmlFor="profile-image-input" className="upload-button">
          {loading ? 'Uploading...' : 'Change Photo'}
        </label>
      </div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>{user.phone}</p>
    </div>
  );
};

export default UserProfile;
```

### **Vue.js Example**
```vue
<template>
  <div class="user-profile">
    <div class="profile-image-container">
      <img 
        :src="getImageUrl(user.profileImage)" 
        alt="Profile" 
        class="profile-image"
      />
      <input
        type="file"
        accept="image/*"
        @change="handleImageUpload"
        :disabled="loading"
        ref="fileInput"
        style="display: none"
      />
      <button @click="$refs.fileInput.click()" :disabled="loading">
        {{ loading ? 'Uploading...' : 'Change Photo' }}
      </button>
    </div>
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false
    }
  },
  props: {
    user: Object,
    token: String
  },
  methods: {
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.loading = true;
      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        const response = await fetch(`/api/Users/upload-profile-image/${this.user._id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: formData
        });

        const data = await response.json();
        
        if (data.success) {
          this.user.profileImage = data.data.profileImage;
          this.$emit('profile-updated', data.data);
        } else {
          alert('Error uploading image: ' + data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error uploading image');
      } finally {
        this.loading = false;
      }
    },
    getImageUrl(imagePath) {
      if (!imagePath) return '/default-avatar.png';
      return `http://localhost:5000/${imagePath}`;
    }
  }
}
</script>
```

## 🎯 **Use Cases**

### **1. User Registration with Profile Picture**
- Users can upload a profile image during registration
- Image is automatically processed and stored

### **2. Profile Management**
- Users can update their profile image anytime
- Old images are automatically deleted when updating

### **3. User Dashboard**
- Display user profile images in dashboards
- Show profile pictures in user lists

### **4. Mobile App Integration**
- Perfect for mobile app profile management
- Supports all common image formats

## ⚠️ **Important Notes**

1. **File Validation**: Only image files are allowed (JPG, PNG, GIF, WebP, etc.)
2. **File Size Limit**: Maximum 5MB per file
3. **Single Image**: Only one profile image per user
4. **Automatic Cleanup**: Old images are deleted when updating
5. **Authentication**: Profile image upload requires authentication
6. **Image URLs**: Construct full URLs with server base URL

## 🔧 **Testing Checklist**

- [ ] Create user with profile image
- [ ] Update user with new profile image
- [ ] Upload profile image only
- [ ] Test with different image formats
- [ ] Test file size limits
- [ ] Test authentication requirements
- [ ] Verify old image deletion
- [ ] Test error handling

## 🚀 **Quick Start**

1. **Test user creation** with profile image
2. **Test profile image upload** separately
3. **Implement in frontend** using the examples
4. **Add proper error handling**
5. **Test with different image sizes and formats**

The user profile image functionality is now ready to use! 🎉
