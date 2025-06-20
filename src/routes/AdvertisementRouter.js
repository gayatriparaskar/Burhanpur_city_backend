const express = require('express');
const advertisementRoutes = express.Router();
const advertisementController = require('../controllers/AdvertisementController');

// Create Advertisement
advertisementRoutes.post('/registerAdd', advertisementController.createAdvertisement);

// Get All Advertisements
advertisementRoutes.get('/getAllAdd', advertisementController.getAllAdvertisements);

// Get Advertisement by ID
advertisementRoutes.get('/getAddById/:id', advertisementController.getAdvertisementById);

// Update Advertisement by ID
advertisementRoutes.put('/updateAdd/:id', advertisementController.updateAdvertisement);

// Delete Advertisement by ID
advertisementRoutes.delete('/deleteAdd/:id', advertisementController.deleteAdvertisement);

// Get Top 10 Advertisements
advertisementRoutes.get('/getTop10Add', advertisementController.getTop10Advertisements);

module.exports = advertisementRoutes;
