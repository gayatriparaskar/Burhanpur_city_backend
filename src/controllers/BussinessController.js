const mongoose = require("mongoose");
const BussinessModel = require("../models/Business");
const { errorResponse, successResponse } = require("../helper/successAndError");

const SubCategoryModel = require("../models/SubCategory"); // Adjust path as needed

module.exports.createBussiness = async (req, res) => {
  try {
    const data = req.body;

    // 1. Optional: Check if subCategory exists if provided
    if (data.subCategory) {
      const subCategoryExists = await SubCategoryModel.findById(data.subCategory);
      if (!subCategoryExists) {
        return res.status(400).json(errorResponse(400, "Invalid subCategory ID"));
      }
    }

     // 2. Check if business with same name exists in the same subCategory (optional)
    const name = data.name.trim();
    const existingBusiness = await BussinessModel.findOne({
      name,
      subCategory: data.subCategory,
    }).collation({ locale: "en", strength: 2 });

     if (existingBusiness) {
      return res
        .status(404)
        .json(errorResponse(404, "Business already exists", existingBusiness));
    }


    // 3. Save new business
    const newBusiness = new BussinessModel(data);
    await newBusiness.save();

    // 4. Populate references
    await newBusiness.populate([
      { path: "category", select: "id name" },
      { path: "owner", select: "id name" },
      { path: "subCategory", select: "id name" },
    ]);

    return res
      .status(200)
      .json(successResponse(200, "Business added successfully", newBusiness));
  } catch (error) {
    return res
      .status(500)
      .json(errorResponse(500, "Something went wrong", error.message));
  }
};

module.exports.getBussiness = async (req, res) => {
  try {
    const getBussiness = await BussinessModel.find();
    res
      .status(200)
      .json(successResponse(200, "Get Bussiness model", getBussiness));
  } catch (error) {
    res
      .status(500)
      .json(errorResponse(500, error.message || "Invalid Credentials"));
  }
};

module.exports.updateBussiness = async (req, res) => {
  try {
    const id = req.params.id;
    const query = req.body;
    const updatedBuss = await BussinessModel.findByIdAndUpdate(id, query, {
      new: true,
      runValidators: true,
    });
    res
      .status(200)
      .json(successResponse(200, "Bussiness is updated", updatedBuss));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Invalid Credentials"));
  }
};

module.exports.deletedBuss = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedBuss = await BussinessModel.findByIdAndDelete(id);
    res
      .status(200)
      .json(
        successResponse(200, "Bussiness is deleted successfully", deletedBuss)
      );
  } catch (error) {
    res.status(500).json(errorResponse(500, "Invalid Credentials"));
  }
};
