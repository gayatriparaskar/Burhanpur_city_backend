# Postman Testing Guide for Image Upload APIs

This guide provides step-by-step instructions for testing the image upload functionality using Postman.

## Prerequisites

1. **Postman installed** on your system
2. **Server running** on `http://localhost:3000` (or your server URL)
3. **Image files** ready for testing (JPG, PNG, etc.)
4. **Authentication tokens** (for protected endpoints)

## Test Cases

### 1. Business Image Upload Tests

#### Test 1.1: Create Business with Image
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/business/registerBuss`
- **Headers**: None required
- **Body Type**: `form-data`
- **Body Fields**:
  ```
  Key: name
  Type: Text
  Value: "Test Business"

  Key: description
  Type: Text
  Value: "This is a test business"

  Key: category
  Type: Text
  Value: "64a1b2c3d4e5f6789012345" (replace with actual category ID)

  Key: subCategory
  Type: Text
  Value: "64a1b2c3d4e5f6789012346" (replace with actual subcategory ID)

  Key: owner
  Type: Text
  Value: "64a1b2c3d4e5f6789012347" (replace with actual user ID)

  Key: address[street]
  Type: Text
  Value: "123 Main Street"

  Key: address[city]
  Type: Text
  Value: "Test City"

  Key: address[state]
  Type: Text
  Value: "Test State"

  Key: address[pincode]
  Type: Text
  Value: "123456"

  Key: contact[phone]
  Type: Text
  Value: "1234567890"

  Key: contact[email]
  Type: Text
  Value: "test@business.com"

  Key: speciality
  Type: Text
  Value: "Test Speciality"

  Key: features
  Type: Text
  Value: "Feature 1, Feature 2, Feature 3"

  Key: keyWords
  Type: Text
  Value: "keyword1, keyword2, keyword3"

  Key: image
  Type: File
  Value: [Select an image file from your computer]
  ```

#### Test 1.2: Update Business with Image
- **Method**: `PUT`
- **URL**: `http://localhost:3000/api/business/updateBuss/{business_id}`
- **Headers**:
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Body Type**: `form-data`
- **Body Fields**:
  ```
  Key: name
  Type: Text
  Value: "Updated Business Name"

  Key: description
  Type: Text
  Value: "Updated business description"

  Key: image
  Type: File
  Value: [Select a new image file]
  ```

#### Test 1.3: Upload Business Image Only
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/business/upload-image/{business_id}`
- **Headers**:
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Body Type**: `form-data`
- **Body Fields**:
  ```
  Key: image
  Type: File
  Value: [Select an image file]
  ```

### 2. Product Image Upload Tests

#### Test 2.1: Create Product with Multiple Images
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/product/createproduct`
- **Headers**: None required
- **Body Type**: `form-data`
- **Body Fields**:
  ```
  Key: name
  Type: Text
  Value: "Test Product"

  Key: description
  Type: Text
  Value: "This is a test product"

  Key: price
  Type: Text
  Value: "99.99"

  Key: offerPrice
  Type: Text
  Value: "79.99"

  Key: brand
  Type: Text
  Value: "Test Brand"

  Key: bussinessId
  Type: Text
  Value: "64a1b2c3d4e5f6789012348" (replace with actual business ID)

  Key: inStock
  Type: Text
  Value: "true"

  Key: quantity
  Type: Text
  Value: "100"

  Key: speciality
  Type: Text
  Value: "Test Product Speciality"

  Key: keyWord
  Type: Text
  Value: "product, test, sample"

  Key: images
  Type: File
  Value: [Select first image file]

  Key: images
  Type: File
  Value: [Select second image file]

  Key: images
  Type: File
  Value: [Select third image file]
  ```

#### Test 2.2: Update Product with Images
- **Method**: `PUT`
- **URL**: `http://localhost:3000/api/product/updateProduct/{product_id}`
- **Headers**:
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Body Type**: `form-data`
- **Body Fields**:
  ```
  Key: name
  Type: Text
  Value: "Updated Product Name"

  Key: price
  Type: Text
  Value: "149.99"

  Key: images
  Type: File
  Value: [Select new image files - up to 5]
  ```

#### Test 2.3: Upload Product Images Only
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/product/upload-images/{product_id}`
- **Headers**:
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Body Type**: `form-data`
- **Body Fields**:
  ```
  Key: images
  Type: File
  Value: [Select multiple image files - up to 5]
  ```

### 3. Advertisement Image Upload Tests

#### Test 3.1: Create Advertisement with Image
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/advertisement/registerAdd`
- **Headers**: None required
- **Body Type**: `form-data`
- **Body Fields**:
  ```
  Key: title
  Type: Text
  Value: "Test Advertisement"

  Key: description
  Type: Text
  Value: "This is a test advertisement"

  Key: business
  Type: Text
  Value: "64a1b2c3d4e5f6789012348" (replace with actual business ID)

  Key: url
  Type: Text
  Value: "https://example.com"

  Key: position
  Type: Text
  Value: "home_banner"

  Key: addType
  Type: Text
  Value: "slider"

  Key: startDate
  Type: Text
  Value: "2024-01-01"

  Key: endDate
  Type: Text
  Value: "2024-12-31"

  Key: image
  Type: File
  Value: [Select an image file]
  ```

#### Test 3.2: Update Advertisement with Image
- **Method**: `PUT`
- **URL**: `http://localhost:3000/api/advertisement/updateAdd/{advertisement_id}`
- **Headers**: None required
- **Body Type**: `form-data`
- **Body Fields**:
  ```
  Key: title
  Type: Text
  Value: "Updated Advertisement Title"

  Key: description
  Type: Text
  Value: "Updated advertisement description"

  Key: image
  Type: File
  Value: [Select a new image file]
  ```

#### Test 3.3: Upload Advertisement Image Only
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/advertisement/upload-image/{advertisement_id}`
- **Headers**: None required
- **Body Type**: `form-data`
- **Body Fields**:
  ```
  Key: image
  Type: File
  Value: [Select an image file]
  ```

## Step-by-Step Postman Setup

### 1. Create a New Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it "Image Upload Tests"

### 2. Set Up Environment Variables
1. Click "Environments" → "Create Environment"
2. Name it "Local Development"
3. Add variables:
   ```
   base_url: http://localhost:3000
   auth_token: YOUR_JWT_TOKEN_HERE
   business_id: YOUR_BUSINESS_ID_HERE
   product_id: YOUR_PRODUCT_ID_HERE
   advertisement_id: YOUR_ADVERTISEMENT_ID_HERE
   ```

### 3. Create Requests

#### For each test case:
1. Click "New" → "Request"
2. Set the method (GET, POST, PUT, DELETE)
3. Enter the URL using environment variables: `{{base_url}}/api/endpoint`
4. Add headers if needed
5. Set body type to "form-data"
6. Add the fields as specified above
7. Save to your collection

## Expected Responses

### Success Response (201/200)
```json
{
  "success": true,
  "message": "Business created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012349",
    "name": "Test Business",
    "images": "uploads/images/businesses/business-1234567890-123456789.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response (400/500)
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB.",
  "error": "LIMIT_FILE_SIZE"
}
```

## Common Error Scenarios to Test

### 1. File Too Large
- Upload an image larger than 5MB
- Expected: 400 error with "File too large" message

### 2. Invalid File Type
- Upload a non-image file (e.g., .txt, .pdf)
- Expected: 400 error with "Only image files are allowed" message

### 3. Too Many Files
- For products, upload more than 5 images
- Expected: 400 error with "Too many files" message

### 4. No File Provided
- Submit form without selecting any file
- Expected: 400 error with "No image file provided" message

### 5. Authentication Required
- Try to access protected endpoints without token
- Expected: 401 error with "Access denied" message

## Testing Checklist

- [ ] Business creation with image
- [ ] Business update with image
- [ ] Business image upload only
- [ ] Product creation with multiple images
- [ ] Product update with images
- [ ] Product image upload only
- [ ] Advertisement creation with image
- [ ] Advertisement update with image
- [ ] Advertisement image upload only
- [ ] Error handling (file too large)
- [ ] Error handling (invalid file type)
- [ ] Error handling (too many files)
- [ ] Authentication testing

## Tips for Testing

1. **Use different image sizes** to test file size limits
2. **Test with various image formats** (JPG, PNG, GIF, WebP)
3. **Verify file paths** in the response data
4. **Check file organization** in the uploads directory
5. **Test error scenarios** to ensure proper validation
6. **Use environment variables** for easy URL and token management
7. **Save successful requests** as examples for future use

## Quick Test Script

You can also use this cURL command for quick testing:

```bash
# Test Business Creation with Image
curl -X POST http://localhost:3000/api/business/registerBuss \
  -F "name=Test Business" \
  -F "description=Test Description" \
  -F "category=YOUR_CATEGORY_ID" \
  -F "subCategory=YOUR_SUBCATEGORY_ID" \
  -F "owner=YOUR_USER_ID" \
  -F "image=@/path/to/your/image.jpg"
```

Replace the placeholder IDs with actual values from your database.
