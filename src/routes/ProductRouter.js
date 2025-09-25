const express = require("express");
const productrouter = express.Router();
const authentication = require("../middleware/authentication");
const { checkRole } = require("../middleware/authorization");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  getPendingProducts,
  getAllProductsForAdmin
} = require("../controllers/ProductController");

// Create product
productrouter.post("/createproduct", createProduct);

// Get all products (only approved)
productrouter.get("/productDetails", getAllProducts);

// Get single product by ID
productrouter.get("/ProductDetails/:id", getProductById);

// Update product by ID
productrouter.put("/updateProduct/:id", updateProduct);

// Delete product by ID
productrouter.delete("/deleteProduct/:id", deleteProduct);

// Admin routes for product approval
productrouter.get("/admin/pending", authentication, checkRole('admin'), getPendingProducts);
productrouter.get("/admin/all", authentication, checkRole('admin'), getAllProductsForAdmin);
productrouter.put("/admin/approve/:id", authentication, checkRole('admin'), approveProduct);
productrouter.put("/admin/reject/:id", authentication, checkRole('admin'), rejectProduct);

module.exports = productrouter;