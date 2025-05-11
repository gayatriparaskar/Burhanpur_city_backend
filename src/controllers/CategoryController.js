const CategoryModel = require ("../models/Category");
const { errorResponse, successResponse } = require("../helper/successAndError");

module.exports.createCategory = async (req, res) => {
    try {
        const data = req.body;
        data.user = req.user.id;

        const existOne = await CategoryModel.findOne({ name: data.name });
        if (existOne) {
            return res.status(404).json(errorResponse(404, "Category already exists Cannot generae this", existOne));
        }

        const newCategory = new CategoryModel(data); // <-- pass data here!
        await newCategory.save();

        res.status(200).json(successResponse(200, "Category created successfully", newCategory));
    } catch (error) {
        res.status(500).json(errorResponse(500, "Category is invalid", error));
    }
};

// In CategoryController.js
module.exports.getCategory = async (req, res) => {
    try {
        const categoryDetail = await CategoryModel.find();
        res.status(200).json({
            success: true,
            message: 'Category data is fetched successfully',
            data: categoryDetail
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Category not found',
            error: error.message
        });
    }
};


module.exports.updateCategory = async(req,res)=>{
    try {
        const data = req.body;
        const id = req.params.id;
        const updateCategory = await CategoryModel.findByIdAndUpdate(id,data,{
            new:true,
            runValidators:true
        });
        res.status(200).json(successResponse(200,"Category is updated successfully",updateCategory));
    } catch (error) {
        res.status(500).json(errorResponse(500,"Category is not updated",error));
    }
};

module.exports.deleteCategory = async(req,res)=>{
    try {
        const id = req.params.id;
        const deletedCategory = await CategoryModel.findByIdAndDelete(id);
        res.status(200).json(successResponse(200,"Category is deleted",deletedCategory));
    } catch (error) {
        res.status(500).json(errorResponse(500,"Category is not Deleted",error));
    }
};


