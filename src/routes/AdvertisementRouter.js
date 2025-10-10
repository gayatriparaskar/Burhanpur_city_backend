const express = require('express');
const advertisementRoutes = express.Router();
const { uploadAdvertisementImage, handleUploadError } = require("../middleware/upload");
const {createAdvertisement,getAllAdvertisements, getAdvertisementById,updateAdvertisement, deleteAdvertisement, uploadAdvertisementImage: uploadAdvertisementImageController } = require('../controllers/AdvertisementController');

// POST /advertisements
advertisementRoutes.post('/registerAdd', uploadAdvertisementImage, handleUploadError, createAdvertisement);

// GET /advertisements
advertisementRoutes.get('/getAllAdd', getAllAdvertisements);

// GET /advertisements/:id
advertisementRoutes.get('/getAddById/:id', getAdvertisementById);

// PUT /advertisements/:id
advertisementRoutes.put('/updateAdd/:id', uploadAdvertisementImage, handleUploadError, updateAdvertisement);

// DELETE /advertisements/:id
advertisementRoutes.delete('/deleteAdd/:id', deleteAdvertisement);

// Upload advertisement image
advertisementRoutes.post('/upload-image/:id', uploadAdvertisementImage, handleUploadError, uploadAdvertisementImageController);

module.exports = advertisementRoutes;
