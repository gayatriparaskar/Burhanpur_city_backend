# Image Upload Documentation

This document explains how to use the image upload functionality for Business, Product, and Advertisement entities in the Burhanpur City Backend API.

## Overview

The image upload system has been implemented with the following features:
- Support for single image upload for Business and Advertisement
- Support for multiple image upload for Products (up to 5 images)
- Automatic file organization in dedicated directories
- Image validation (only image files allowed)
- File size limit (5MB per file)
- Automatic cleanup of old images when updating
- Proper error handling and validation

## Directory Structure

```
uploads/
├── images/
│   ├── businesses/     # Business images
│   ├── products/      # Product images
│   └── advertisements/ # Advertisement images
└── temp/              # Temporary files
```

## API Endpoints

### Business Image Upload

#### 1. Create Business with Image
- **Endpoint**: `POST /api/business/registerBuss`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `image`: Image file (single file)
  - Other business fields (name, description, etc.)

#### 2. Update Business with Image
- **Endpoint**: `PUT /api/business/updateBuss/:id`
- **Content-Type**: `multipart/form-data`
- **Headers**: `Authorization: Bearer <token>`
- **Fields**:
  - `image`: Image file (single file)
  - Other business fields to update

#### 3. Upload Business Image Only
- **Endpoint**: `POST /api/business/upload-image/:id`
- **Content-Type**: `multipart/form-data`
- **Headers**: `Authorization: Bearer <token>`
- **Fields**:
  - `image`: Image file (single file)

### Product Image Upload

#### 1. Create Product with Images
- **Endpoint**: `POST /api/product/createproduct`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `images`: Image files (multiple files, up to 5)
  - Other product fields (name, description, etc.)

#### 2. Update Product with Images
- **Endpoint**: `PUT /api/product/updateProduct/:id`
- **Content-Type**: `multipart/form-data`
- **Headers**: `Authorization: Bearer <token>`
- **Fields**:
  - `images`: Image files (multiple files, up to 5)
  - Other product fields to update

#### 3. Upload Product Images Only
- **Endpoint**: `POST /api/product/upload-images/:id`
- **Content-Type**: `multipart/form-data`
- **Headers**: `Authorization: Bearer <token>`
- **Fields**:
  - `images`: Image files (multiple files, up to 5)

### Advertisement Image Upload

#### 1. Create Advertisement with Image
- **Endpoint**: `POST /api/advertisement/registerAdd`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `image`: Image file (single file)
  - Other advertisement fields (title, description, etc.)

#### 2. Update Advertisement with Image
- **Endpoint**: `PUT /api/advertisement/updateAdd/:id`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `image`: Image file (single file)
  - Other advertisement fields to update

#### 3. Upload Advertisement Image Only
- **Endpoint**: `POST /api/advertisement/upload-image/:id`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `image`: Image file (single file)

## Request Examples

### Using cURL

#### Create Business with Image
```bash
curl -X POST http://localhost:3000/api/business/registerBuss \
  -F "name=My Business" \
  -F "description=Business description" \
  -F "category=64a1b2c3d4e5f6789012345" \
  -F "subCategory=64a1b2c3d4e5f6789012346" \
  -F "owner=64a1b2c3d4e5f6789012347" \
  -F "image=@/path/to/image.jpg"
```

#### Create Product with Multiple Images
```bash
curl -X POST http://localhost:3000/api/product/createproduct \
  -F "name=My Product" \
  -F "description=Product description" \
  -F "price=100" \
  -F "bussinessId=64a1b2c3d4e5f6789012348" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg"
```

### Using JavaScript/Fetch

#### Create Business with Image
```javascript
const formData = new FormData();
formData.append('name', 'My Business');
formData.append('description', 'Business description');
formData.append('category', '64a1b2c3d4e5f6789012345');
formData.append('subCategory', '64a1b2c3d4e5f6789012346');
formData.append('owner', '64a1b2c3d4e5f6789012347');
formData.append('image', fileInput.files[0]);

fetch('/api/business/registerBuss', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

#### Create Product with Multiple Images
```javascript
const formData = new FormData();
formData.append('name', 'My Product');
formData.append('description', 'Product description');
formData.append('price', '100');
formData.append('bussinessId', '64a1b2c3d4e5f6789012348');

// Add multiple images
for (let i = 0; i < fileInput.files.length; i++) {
  formData.append('images', fileInput.files[i]);
}

fetch('/api/product/createproduct', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Business created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012349",
    "name": "My Business",
    "images": "uploads/images/businesses/business-1234567890-123456789.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB.",
  "error": "LIMIT_FILE_SIZE"
}
```

## File Validation

- **File Types**: Only image files are allowed (jpg, jpeg, png, gif, webp, etc.)
- **File Size**: Maximum 5MB per file
- **File Count**: 
  - Business: 1 image
  - Product: Up to 5 images
  - Advertisement: 1 image

## Error Handling

The system handles various error scenarios:

1. **File too large**: Returns 400 error with message "File too large. Maximum size is 5MB."
2. **Invalid file type**: Returns 400 error with message "Only image files are allowed"
3. **Too many files**: Returns 400 error with message "Too many files. Please check the limit."
4. **No file provided**: Returns 400 error with message "No image file provided"

## Security Features

1. **File Type Validation**: Only image files are accepted
2. **File Size Limits**: Prevents large file uploads
3. **Directory Organization**: Files are stored in organized directories
4. **Automatic Cleanup**: Old images are deleted when updating
5. **Unique Filenames**: Prevents filename conflicts

## Database Schema

The image paths are stored in the database as follows:

### Business Model
```javascript
{
  images: String  // Single image path
}
```

### Product Model
```javascript
{
  image: [String]  // Array of image paths
}
```

### Advertisement Model
```javascript
{
  image: String    // Single image path
}
```

## Best Practices

1. **Always validate file types** on the client side before uploading
2. **Compress images** before uploading to reduce file size
3. **Use appropriate image dimensions** for your use case
4. **Handle errors gracefully** in your frontend application
5. **Show upload progress** for better user experience

## Troubleshooting

### Common Issues

1. **"Only image files are allowed"**
   - Ensure you're uploading a valid image file
   - Check the file extension and MIME type

2. **"File too large"**
   - Compress the image or reduce its dimensions
   - Maximum file size is 5MB

3. **"Too many files"**
   - For products, maximum 5 images allowed
   - For business and advertisement, only 1 image allowed

4. **Upload directory not found**
   - The system automatically creates upload directories
   - Ensure the application has write permissions

### Testing

You can test the image upload functionality using:
- Postman with form-data
- cURL commands
- Frontend applications with file input elements
- API testing tools like Insomnia or Thunder Client

## Notes

- Images are stored with unique filenames to prevent conflicts
- Old images are automatically deleted when updating
- The system supports all common image formats
- File paths are stored as relative paths in the database
- The upload middleware handles all validation and file processing
