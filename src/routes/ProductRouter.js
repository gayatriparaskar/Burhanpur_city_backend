const express = require("express");
const productrouter = express.Router();
const {createProduct,getAllProducts,getProductById,updateProduct,deleteProduct} = require("../controllers/ProductController");

// Create product
productrouter.post("/createproduct",createProduct);

// Get all products
productrouter.get("/productDetails",getAllProducts);

// Get single product by ID
productrouter.get("/ProductDetails/:id",getProductById);

// Update product by ID
productrouter.put("/updateProduct/:id",updateProduct);

// Delete product by ID
productrouter.delete("/deleteProduct/:id", deleteProduct);

module.exports = productrouter;