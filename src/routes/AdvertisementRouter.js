const express = require('express');
const advertisementRoutes = express.Router();
const advertisementController = require('../controllers/AdvertisementController');

// POST /advertisements
advertisementRoutes.post('/registerAdd', advertisementController.createAdvertisement);

// GET /advertisements
advertisementRoutes.get('/getAllAdd', advertisementController.getAllAdvertisements);

// GET /advertisements/:id
advertisementRoutes.get('/getAddById:id', advertisementController.getAdvertisementById);

// PUT /advertisements/:id
advertisementRoutes.put('/updateAdd:id', advertisementController.updateAdvertisement);

// DELETE /advertisements/:id
advertisementRoutes.delete('/deleteAdd:id', advertisementController.deleteAdvertisement);

module.exports = advertisementRoutes;
