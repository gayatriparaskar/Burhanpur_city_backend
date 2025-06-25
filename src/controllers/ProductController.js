const ProductModel = require("../models/Product");  // adjust path as per your structure
const { successResponse, errorResponse } = require("../helper/successAndError");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const product = new ProductModel(req.body);
    const savedProduct = await product.save();
    res.status(201).json(successResponse(201, "Product created successfully", savedProduct));
  } catch (error) {
    res.status(400).json(errorResponse(400, "Failed to create product", error.message));
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(successResponse(200, "Products retrieved successfully", products));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to retrieve products", error.message));
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json(errorResponse(404, "Product not found"));
    }
    res.status(200).json(successResponse(200, "Product retrieved successfully", product));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to retrieve product", error.message));
  }
};

// Update product by ID
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json(errorResponse(404, "Product not found"));
    }
    res.status(200).json(successResponse(200, "Product updated successfully", updatedProduct));
  } catch (error) {
    res.status(400).json(errorResponse(400, "Failed to update product", error.message));
  }
};

// Delete product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json(errorResponse(404, "Product not found"));
    }
    res.status(200).json(successResponse(200, "Product deleted successfully", deletedProduct));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to delete product", error.message));
  }
};