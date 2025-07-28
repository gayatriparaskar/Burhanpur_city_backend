const express = require("express");
const authentication = require ("../middleware/authentication");

const { createSubCat , getSubCategoryOne , updateSubCategory , deleteSubCategory ,getSubCategoryAll,getSubCategoryByParent} =require ("../controllers/SubCategoryController");

const subcategoryRoutes = express.Router();

subcategoryRoutes.post('/registerSubCategory',createSubCat);
subcategoryRoutes.get('/getSubCategory/:id',getSubCategoryOne);
subcategoryRoutes.get('/getSubCategoryByParent/:categoryId',getSubCategoryByParent);
subcategoryRoutes.get('/getSubCategory',getSubCategoryAll);
subcategoryRoutes.put('/updateSubCategory/:id',updateSubCategory);
subcategoryRoutes.delete('/deleteSubCategory/:id',deleteSubCategory);

module.exports = subcategoryRoutes;