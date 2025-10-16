const express = require("express");
const authentication = require ("../middleware/authentication");
const { successResponse } = require("../helper/successAndError");

const { createSubCat , getSubCategoryOne , updateSubCategory , deleteSubCategory ,getSubCategoryAll,getSubCategoryByParent} =require ("../controllers/SubCategoryController");

const subcategoryRoutes = express.Router();

subcategoryRoutes.post('/registerSubCategory', createSubCat);
subcategoryRoutes.get('/getSubCategory/:id',getSubCategoryOne);
subcategoryRoutes.get('/getSubCategoryByParent/:categoryId',getSubCategoryByParent);
subcategoryRoutes.get('/getSubCategory',getSubCategoryAll);
subcategoryRoutes.put('/updateSubCategory/:id', updateSubCategory);
subcategoryRoutes.delete('/deleteSubCategory/:id',deleteSubCategory);
subcategoryRoutes.post('/upload-image/:id', (req, res) => {
    res.status(200).json(successResponse(200, "Image upload endpoint - middleware removed", {
        message: "Upload functionality needs to be implemented"
    }));
});

module.exports = subcategoryRoutes;