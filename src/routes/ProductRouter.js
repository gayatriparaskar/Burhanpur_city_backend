const express = require("express");
const productrouter = express.Router();
const authentication = require("../middleware/authentication");
const { checkRole } = require("../middleware/authorization");
const { uploadProductImages, handleUploadError } = require("../middleware/upload");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  getPendingProducts,
  getAllProductsForAdmin,
  uploadProductImages: uploadProductImagesController,
  getProductsByBusiness,
  getMyBusinessProducts
} = require("../controllers/ProductController");

// Create product
productrouter.post("/createproduct", uploadProductImages, handleUploadError, createProduct);

// Get all products (only approved)
productrouter.get("/productDetails", getAllProducts);

// Get single product by ID
productrouter.get("/ProductDetails/:id", getProductById);

// Update product by ID (unified for owner and admin)
productrouter.put("/updateProduct/:id", authentication, updateProduct);

// Delete product by ID
productrouter.delete("/deleteProduct/:id", deleteProduct);

// Upload product images
productrouter.post("/upload-images/:id", authentication, uploadProductImages, handleUploadError, uploadProductImagesController);

// Get products by business ID (public - only approved products)
productrouter.get("/business/:businessId", getProductsByBusiness);

// Get products by business ID (for business owner - includes all products)
productrouter.get("/my-business/:businessId", authentication, getMyBusinessProducts);

// Admin routes for product approval
productrouter.get("/admin/pending", authentication, checkRole('admin'), getPendingProducts);
productrouter.get("/admin/all", authentication, checkRole('admin'), getAllProductsForAdmin);
productrouter.put("/admin/approve/:id", authentication, checkRole('admin'), approveProduct);
productrouter.put("/admin/reject/:id", authentication, checkRole('admin'), rejectProduct);

module.exports = productrouter;