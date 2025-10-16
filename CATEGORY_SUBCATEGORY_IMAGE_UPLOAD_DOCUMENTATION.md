# Category & SubCategory Image Upload Documentation

This document explains the image upload functionality for Category and SubCategory entities in the Burhanpur City Backend API.

## 🎯 **Overview**

The image upload system has been implemented for both Category and SubCategory with the following features:
- Single image upload per category/subcategory
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
│   ├── users/         # User profile images
│   ├── categories/    # Category images (NEW)
│   └── subcategories/ # SubCategory images (NEW)
└── temp/              # Temporary files
```

## 🔧 **API Endpoints**

### **Category Image Upload**

#### **1. Create Category with Image**
- **Endpoint**: `POST /api/category/createCategory`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Not required
- **Fields**:
  - `name`: Category name (required)
  - `description`: Category description (optional)
  - `type`: Category type (optional)
  - `image`: Category image file (optional)

#### **2. Update Category with Image**
- **Endpoint**: `PUT /api/category/updateCategory/:id`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Not required
- **Fields**:
  - `name`: Updated name (optional)
  - `description`: Updated description (optional)
  - `type`: Updated type (optional)
  - `image`: New category image file (optional)

#### **3. Upload Category Image Only**
- **Endpoint**: `POST /api/category/upload-image/:id`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Not required
- **Fields**:
  - `image`: Category image file

### **SubCategory Image Upload**

#### **1. Create SubCategory with Image**
- **Endpoint**: `POST /api/subcategory/registerSubCategory`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Not required
- **Fields**:
  - `name`: SubCategory name (required)
  - `title`: SubCategory title (optional)
  - `category`: Parent category ID (required)
  - `description`: SubCategory description (optional)
  - `image`: SubCategory image file (optional)
  - Other subcategory fields...

#### **2. Update SubCategory with Image**
- **Endpoint**: `PUT /api/subcategory/updateSubCategory/:id`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Not required
- **Fields**:
  - `name`: Updated name (optional)
  - `title`: Updated title (optional)
  - `description`: Updated description (optional)
  - `image`: New subcategory image file (optional)
  - Other subcategory fields...

#### **3. Upload SubCategory Image Only**
- **Endpoint**: `POST /api/subcategory/upload-image/:id`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Not required
- **Fields**:
  - `image`: SubCategory image file

## 📝 **Request Examples**

### **Using Postman**

#### **Create Category with Image**
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/category/createCategory`
3. **Body Type**: `form-data`
4. **Fields**:
   ```
   name: "Restaurants"
   description: "Food and dining establishments"
   type: "Food & Beverage"
   image: [Select image file]
   ```

#### **Create SubCategory with Image**
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/subcategory/registerSubCategory`
3. **Body Type**: `form-data`
4. **Fields**:
   ```
   name: "Fast Food"
   title: "Quick Service Restaurants"
   category: "CATEGORY_ID"
   description: "Quick service food establishments"
   image: [Select image file]
   ```

#### **Upload Category Image Only**
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/category/upload-image/CATEGORY_ID`
3. **Body Type**: `form-data`
4. **Fields**:
   ```
   image: [Select image file]
   ```

### **Using cURL**

#### **Create Category with Image**
```bash
curl -X POST http://localhost:5000/api/category/createCategory \
  -F "name=Restaurants" \
  -F "description=Food and dining establishments" \
  -F "type=Food & Beverage" \
  -F "image=@/path/to/category.jpg"
```

#### **Create SubCategory with Image**
```bash
curl -X POST http://localhost:5000/api/subcategory/registerSubCategory \
  -F "name=Fast Food" \
  -F "title=Quick Service Restaurants" \
  -F "category=CATEGORY_ID" \
  -F "description=Quick service food establishments" \
  -F "image=@/path/to/subcategory.jpg"
```

#### **Upload Category Image Only**
```bash
curl -X POST http://localhost:5000/api/category/upload-image/CATEGORY_ID \
  -F "image=@/path/to/category.jpg"
```

## 📋 **Response Format**

### **Success Response (200/201)**

#### **Category Created with Image**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012349",
    "name": "Restaurants",
    "description": "Food and dining establishments",
    "type": "Food & Beverage",
    "image": "uploads/images/categories/category-1234567890-123456789.jpg",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### **SubCategory Created with Image**
```json
{
  "success": true,
  "message": "Subcategory created successfully.",
  "data": {
    "_id": "64a1b2c3d4e5f6789012349",
    "name": "Fast Food",
    "title": "Quick Service Restaurants",
    "category": {
      "_id": "64a1b2c3d4e5f6789012348",
      "name": "Restaurants",
      "description": "Food and dining establishments"
    },
    "description": "Quick service food establishments",
    "image": "uploads/images/subcategories/subcategory-1234567890-123456789.jpg",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### **Image Upload Success**
```json
{
  "success": true,
  "message": "Category image uploaded successfully",
  "data": {
    "categoryId": "64a1b2c3d4e5f6789012349",
    "imagePath": "uploads/images/categories/category-1234567890-123456789.jpg"
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

### **React.js Category Creation Form**

```jsx
import React, { useState } from 'react';

const CreateCategory = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add image
      if (image) {
        formDataToSend.append('image', image);
      }

      const response = await fetch('/api/category/createCategory', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        alert('Category created successfully!');
        // Reset form
        setFormData({ name: '', description: '', type: '' });
        setImage(null);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error creating category: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-category-form">
      <h2>Create New Category</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Category Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </div>
  );
};

export default CreateCategory;
```

### **Vue.js SubCategory Creation Form**

```vue
<template>
  <div class="create-subcategory-form">
    <h2>Create New SubCategory</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>SubCategory Name *</label>
        <input
          v-model="formData.name"
          type="text"
          name="name"
          required
        />
      </div>

      <div class="form-group">
        <label>Title</label>
        <input
          v-model="formData.title"
          type="text"
          name="title"
        />
      </div>

      <div class="form-group">
        <label>Parent Category *</label>
        <select v-model="formData.category" name="category" required>
          <option value="">Select Category</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea
          v-model="formData.description"
          name="description"
          rows="3"
        />
      </div>

      <div class="form-group">
        <label>SubCategory Image</label>
        <input
          @change="handleImageChange"
          type="file"
          accept="image/*"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating...' : 'Create SubCategory' }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        name: '',
        title: '',
        category: '',
        description: ''
      },
      image: null,
      categories: [],
      loading: false
    }
  },
  async mounted() {
    await this.fetchCategories();
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await fetch('/api/category/getCategory');
        const result = await response.json();
        this.categories = result.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
    
    handleImageChange(event) {
      this.image = event.target.files[0];
    },
    
    async handleSubmit() {
      this.loading = true;

      try {
        const formDataToSend = new FormData();
        
        // Add form fields
        Object.keys(this.formData).forEach(key => {
          if (this.formData[key] !== '') {
            formDataToSend.append(key, this.formData[key]);
          }
        });

        // Add image
        if (this.image) {
          formDataToSend.append('image', this.image);
        }

        const response = await fetch('/api/subcategory/registerSubCategory', {
          method: 'POST',
          body: formDataToSend
        });

        const result = await response.json();

        if (result.success) {
          alert('SubCategory created successfully!');
          this.resetForm();
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        alert('Error creating subcategory: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    
    resetForm() {
      this.formData = {
        name: '',
        title: '',
        category: '',
        description: ''
      };
      this.image = null;
    }
  }
}
</script>
```

## 🎯 **Use Cases**

### **1. Category Management**
- Create categories with representative images
- Update category images
- Display category images in UI

### **2. SubCategory Management**
- Create subcategories with images
- Update subcategory images
- Display subcategory images in UI

### **3. UI Display**
- Show category/subcategory images in lists
- Display images in detail views
- Use images for navigation

## ⚠️ **Important Notes**

1. **File Validation**: Only image files are allowed (JPG, PNG, GIF, WebP, etc.)
2. **File Size Limit**: Maximum 5MB per file
3. **Single Image**: Only one image per category/subcategory
4. **Automatic Cleanup**: Old images are deleted when updating
5. **Image URLs**: Construct full URLs with server base URL
6. **Directory Structure**: Images are stored in dedicated directories

## 🔧 **Testing Checklist**

- [ ] Create category with image
- [ ] Create subcategory with image
- [ ] Update category with new image
- [ ] Update subcategory with new image
- [ ] Upload category image only
- [ ] Upload subcategory image only
- [ ] Test with different image formats
- [ ] Test file size limits
- [ ] Verify old image deletion
- [ ] Test error handling

## 🚀 **Quick Start**

1. **Test category creation** with image
2. **Test subcategory creation** with image
3. **Test image upload** separately
4. **Implement in frontend** using the examples
5. **Add proper error handling**
6. **Test with different image sizes and formats**

The image upload functionality for Category and SubCategory is now ready to use! 🎉
