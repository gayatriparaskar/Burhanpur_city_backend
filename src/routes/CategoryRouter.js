const express = require ("express");
const authentication = require ("../middleware/authentication");
const { successResponse } = require("../helper/successAndError");

const categoryRoutes = express.Router();
const { createCategory , getCategory , updateCategory , deleteCategory , searchCategory , searchAll} = require ("../controllers/CategoryController");

categoryRoutes.post('/createCategory', createCategory);
categoryRoutes.get('/getCategory',getCategory);
categoryRoutes.put('/updateCategory/:id', updateCategory);
categoryRoutes.delete('/deleteCategory/:id',deleteCategory);
categoryRoutes.get('/searchCategory',searchCategory);
categoryRoutes.get("/search-all", searchAll);
categoryRoutes.post('/upload-image/:id', (req, res) => {
    res.status(200).json(successResponse(200, "Image upload endpoint - middleware removed", {
        message: "Upload functionality needs to be implemented"
    }));
});

module.exports = categoryRoutes ; 