const express = require ("express");
const authentication = require ("../middleware/authentication");

const categoryRoutes = express.Router();
const { createCategory , getCategory , updateCategory , deleteCategory , searchCategory , searchAll} = require ("../controllers/CategoryController");

categoryRoutes.post('/createCategory',createCategory);
categoryRoutes.get('/getCategory',getCategory);
categoryRoutes.put('/updateCategory/:id',updateCategory);
categoryRoutes.delete('/deleteCategory/:id',deleteCategory);
categoryRoutes.get('/searchCategory',searchCategory);
categoryRoutes.get("/search-all", searchAll);

module.exports = categoryRoutes ; 