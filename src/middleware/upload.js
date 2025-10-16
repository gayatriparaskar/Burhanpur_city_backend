const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    'uploads/images/businesses',
    'uploads/images/products', 
    'uploads/images/advertisements',
    'uploads/images/users',
    'uploads/temp'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Call this function to ensure directories exist
ensureUploadDirs();

// Storage configuration for different entity types
const getStorage = (entityType) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath;
      switch (entityType) {
        case 'business':
          uploadPath = 'uploads/images/businesses';
          break;
        case 'product':
          uploadPath = 'uploads/images/products';
          break;
        case 'advertisement':
          uploadPath = 'uploads/images/advertisements';
          break;
        case 'user':
          uploadPath = 'uploads/images/users';
          break;
        default:
          uploadPath = 'uploads/temp';
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const filename = `${entityType}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    }
  });
};

// File filter to allow only images
const imageFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create upload middleware for different entity types
const createUploadMiddleware = (entityType, fieldName = 'image', maxCount = 1) => {
  const storage = getStorage(entityType);
  
  const upload = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: maxCount
    }
  });

  // Return appropriate middleware based on field count
  if (maxCount === 1) {
    return upload.single(fieldName);
  } else {
    return upload.array(fieldName, maxCount);
  }
};

// Specific upload middlewares for each entity
const uploadBusinessImage = createUploadMiddleware('business', 'image', 1);
const uploadProductImages = createUploadMiddleware('product', 'image', 5); // Allow multiple images for products

// Flexible product upload middleware that accepts both 'image' and 'images'
const uploadProductImagesFlexible = (req, res, next) => {
  const storage = getStorage('product');
  
  const upload = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 5
    }
  });
  
  // Use fields to accept both 'image' and 'images'
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ])(req, res, (err) => {
    if (err) {
      return next(err);
    }
    
    // Normalize the files - put all files in req.files.images
    if (req.files) {
      const allFiles = [];
      if (req.files.image) {
        allFiles.push(...req.files.image);
      }
      if (req.files.images) {
        allFiles.push(...req.files.images);
      }
      req.files = allFiles;
    }
    
    next();
  });
};
const uploadAdvertisementImage = createUploadMiddleware('advertisement', 'image', 1);
const uploadUserImage = createUploadMiddleware('user', 'profileImage', 1); // Single profile image for users

// Middleware to ensure form data is properly parsed
const ensureFormDataParsed = (req, res, next) => {
  // Log the request for debugging
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Body before parsing:', req.body);
  
  // Ensure body is an object
  if (!req.body || typeof req.body !== 'object') {
    req.body = {};
  }
  
  next();
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
        error: error.message
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Please check the limit.',
        error: error.message
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: error.message
    });
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed',
      error: error.message
    });
  }
  
  next(error);
};

// Helper function to delete old image file
const deleteOldImage = (imagePath) => {
  if (imagePath && fs.existsSync(imagePath)) {
    try {
      fs.unlinkSync(imagePath);
      console.log(`Deleted old image: ${imagePath}`);
    } catch (error) {
      console.error(`Error deleting old image: ${error.message}`);
    }
  }
};

// Helper function to get relative path for database storage
const getRelativePath = (fullPath) => {
  if (!fullPath) return null;
  // Convert absolute path to relative path for database storage
  return fullPath.replace(/\\/g, '/').replace(/^.*\/uploads\//, 'uploads/');
};

module.exports = {
  uploadBusinessImage,
  uploadProductImages,
  uploadProductImagesFlexible,
  uploadAdvertisementImage,
  uploadUserImage,
  handleUploadError,
  deleteOldImage,
  getRelativePath,
  ensureUploadDirs,
  ensureFormDataParsed
};
