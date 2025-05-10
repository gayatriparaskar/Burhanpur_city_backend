const express = require("express");
const authentication = require ("../middleware/authentication");

const { createSubCat , getSubCategory , updateSubCategory , deleteSubCategory } =require ("../controllers/SubCategoryController");

const subcategoryRoutes = express.Router();

subcategoryRoutes.post('/createSubCategory',authentication,createSubCat);
subcategoryRoutes.get('/getSubCategory',authentication,getSubCategory);
subcategoryRoutes.put('/updateSubCategory/:id',authentication,updateSubCategory);
subcategoryRoutes.delete('/deleteSubCategory/:id',authentication,deleteSubCategory);

module.exports = subcategoryRoutes;