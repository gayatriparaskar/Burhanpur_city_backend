const express = require("express");
const authentication = require ("../middleware/authentication");

const { createSubCat , getSubCategory , updateSubCategory , deleteSubCategory } =require ("../controllers/SubCategoryController");

const subcategoryRoutes = express.Router();

subcategoryRoutes.post('/createSubCategory',createSubCat);
subcategoryRoutes.get('/getSubCategory/:id',getSubCategory);
subcategoryRoutes.put('/updateSubCategory/:id',updateSubCategory);
subcategoryRoutes.delete('/deleteSubCategory/:id',deleteSubCategory);

module.exports = subcategoryRoutes;