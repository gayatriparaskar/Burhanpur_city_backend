const express = require ("express");

const SubCategoryModel = require ("../models/SubCategory");
const { errorResponse, successResponse } = require("../helper/successAndError");

module.exports.createSubCat = async (req, res) => {
  try {
    const {
      name,
      title,
      category,
      description,
      image,
      contact,
      facility,
      membership_plans,
      personal_info,
      count,
      timing,
      calling,
      services,
      emergency
    } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res
        .status(400)
        .json(errorResponse(400, "Name and Category are required."));
    }

    // Check for existing subcategory
    const existOne = await SubCategoryModel.findOne({ name });
    if (existOne) {
      return res
        .status(409)
        .json(errorResponse(409, "Subcategory already exists.", existOne));
    }

    // Create new subcategory
    const newSubCategory = new SubCategoryModel({
      name,
      title,
      category,
      description,
      image,
      contact,
      facility,
      membership_plans,
      personal_info,
      count,
      timing,
      calling,
      services,
      emergency,
      isActive: true
    });

    // Save to DB
    await newSubCategory.save();

    // Populate the category field with only name and description
    const populatedSubCategory = await newSubCategory.populate({
      path: "category",
      select: "name description"
    });

    res
      .status(201)
      .json(
        successResponse(
          201,
          "Subcategory created successfully.",
          populatedSubCategory
        )
      );
  } catch (error) {
    console.error("Error creating subcategory:", error);
    res
      .status(500)
      .json(
        errorResponse(
          500,
          "Subcategory creation failed.",
          error.message || error
        )
      );
  }
};
module.exports.getSubCategoryOne = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const subcategoryDetail = await SubCategoryModel.find({ category: categoryId });

    res
      .status(200)
      .json(successResponse(200, "Category data is fetched successfully", subcategoryDetail));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Category not found", error));
  }
};
module.exports.getSubCategoryAll = async (req, res) => {
  try {
    const subcategoryDetailAll = await SubCategoryModel.find();

    res
      .status(200)
      .json(successResponse(200, "Category data is fetched successfully", subcategoryDetailAll));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Category not found", error));
  }
};


module.exports.updateSubCategory = async(req,res)=>{
    try {
        const data = req.body;
        const id = req.params.id;
        const updateSubCategory = await SubCategoryModel.findByIdAndUpdate(id,data,{
            new:true,
            runValidators:true
        });
        res.status(200).json(successResponse(200,"Category is updated successfully",updateSubCategory));
    } catch (error) {
        res.status(500).json(errorResponse(500,"Category is not updated",error));
    }
};

module.exports.deleteSubCategory = async(req,res)=>{
    try {
        const id = req.params.id;
        const deletedSubCategory = await SubCategoryModel.findByIdAndDelete(id);
        res.status(200).json(successResponse(200,"Category is deleted",deletedSubCategory));
    } catch (error) {
        res.status(500).json(errorResponse(500,"Category is not Deleted",error));
    }
};