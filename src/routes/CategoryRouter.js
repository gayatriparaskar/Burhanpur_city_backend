const express = require ("express");
const authentication = require ("../middleware/authentication");

const categoryRoutes = express.Router();
const { createCategory , getCategory , updateCategory , deleteCategory , searchCategory} = require ("../controllers/CategoryController");

categoryRoutes.post('/createCategory',authentication,createCategory);
categoryRoutes.get('/getCategory',getCategory);
categoryRoutes.put('/updateCategory/:id',authentication,updateCategory);
categoryRoutes.delete('/deleteCategory/:id',authentication,deleteCategory);
categoryRoutes.get('/searchCategory',searchCategory);

module.exports = categoryRoutes ; 