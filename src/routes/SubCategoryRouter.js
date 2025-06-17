const express = require("express");
const authentication = require ("../middleware/authentication");

const { createSubCat , getSubCategoryOne , updateSubCategory , deleteSubCategory ,getSubCategoryAll} =require ("../controllers/SubCategoryController");

const subcategoryRoutes = express.Router();

subcategoryRoutes.post('/registerSubCategory',createSubCat);
subcategoryRoutes.get('/getSubCategory/:categoryId',getSubCategoryOne);
subcategoryRoutes.get('/getSubCategory',getSubCategoryAll);
subcategoryRoutes.put('/updateSubCategory/:id',updateSubCategory);
subcategoryRoutes.delete('/deleteSubCategory/:id',deleteSubCategory);

module.exports = subcategoryRoutes;