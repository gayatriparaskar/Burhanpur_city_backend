/**
 * Test script to demonstrate Category and SubCategory image upload
 * Run this script to test the image upload functionality
 */

const fetch = require('node-fetch'); // Install with: npm install node-fetch
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000/api';

async function testCategoryImageUpload() {
  console.log('🖼️ Testing Category & SubCategory Image Upload\n');

  try {
    // Step 1: Create Category with Image
    console.log('📁 Step 1: Creating Category with Image...');
    const categoryFormData = new FormData();
    categoryFormData.append('name', 'Test Category');
    categoryFormData.append('description', 'Test category description');
    categoryFormData.append('type', 'Test Type');
    
    // Note: In real testing, you would provide an actual image file
    // categoryFormData.append('image', fs.createReadStream('/path/to/test-image.jpg'));

    const categoryResponse = await fetch(`${BASE_URL}/category/createCategory`, {
      method: 'POST',
      body: categoryFormData
    });

    const categoryData = await categoryResponse.json();
    console.log('✅ Category Created:', categoryData);

    if (!categoryData.success) {
      throw new Error(`Failed to create category: ${categoryData.message}`);
    }

    const categoryId = categoryData.data._id;

    // Step 2: Create SubCategory with Image
    console.log('\n📁 Step 2: Creating SubCategory with Image...');
    const subCategoryFormData = new FormData();
    subCategoryFormData.append('name', 'Test SubCategory');
    subCategoryFormData.append('title', 'Test SubCategory Title');
    subCategoryFormData.append('category', categoryId);
    subCategoryFormData.append('description', 'Test subcategory description');
    
    // Note: In real testing, you would provide an actual image file
    // subCategoryFormData.append('image', fs.createReadStream('/path/to/test-image.jpg'));

    const subCategoryResponse = await fetch(`${BASE_URL}/subcategory/registerSubCategory`, {
      method: 'POST',
      body: subCategoryFormData
    });

    const subCategoryData = await subCategoryResponse.json();
    console.log('✅ SubCategory Created:', subCategoryData);

    if (!subCategoryData.success) {
      throw new Error(`Failed to create subcategory: ${subCategoryData.message}`);
    }

    const subCategoryId = subCategoryData.data._id;

    // Step 3: Test Image Upload for Category
    console.log('\n📤 Step 3: Testing Category Image Upload...');
    const categoryImageFormData = new FormData();
    // Note: In real testing, you would provide an actual image file
    // categoryImageFormData.append('image', fs.createReadStream('/path/to/test-image.jpg'));

    const categoryImageResponse = await fetch(`${BASE_URL}/category/upload-image/${categoryId}`, {
      method: 'POST',
      body: categoryImageFormData
    });

    const categoryImageData = await categoryImageResponse.json();
    console.log('❌ Category Image Upload (Expected to fail without actual image):', categoryImageData);

    // Step 4: Test Image Upload for SubCategory
    console.log('\n📤 Step 4: Testing SubCategory Image Upload...');
    const subCategoryImageFormData = new FormData();
    // Note: In real testing, you would provide an actual image file
    // subCategoryImageFormData.append('image', fs.createReadStream('/path/to/test-image.jpg'));

    const subCategoryImageResponse = await fetch(`${BASE_URL}/subcategory/upload-image/${subCategoryId}`, {
      method: 'POST',
      body: subCategoryImageFormData
    });

    const subCategoryImageData = await subCategoryImageResponse.json();
    console.log('❌ SubCategory Image Upload (Expected to fail without actual image):', subCategoryImageData);

    console.log('\n✅ Image Upload Test Completed!');
    console.log('\n📝 Notes:');
    console.log('- Category and SubCategory creation should work');
    console.log('- Image upload will fail without actual image files (expected)');
    console.log('- Replace dummy image paths with actual image files for real testing');
    console.log('- Test with different image formats (JPG, PNG, GIF, WebP)');
    console.log('- Test file size limits (max 5MB)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testCategoryImageUpload();
}

module.exports = { testCategoryImageUpload };
