const express = require('express');
const advertisementRoutes = express.Router();
const {createAdvertisement,getAllAdvertisements, getAdvertisementById,updateAdvertisement,  deleteAdvertisement } = require('../controllers/AdvertisementController');

// POST /advertisements
advertisementRoutes.post('/registerAdd', createAdvertisement);

// GET /advertisements
advertisementRoutes.get('/getAllAdd', getAllAdvertisements);

// GET /advertisements/:id
advertisementRoutes.get('/getAddById/:id', getAdvertisementById);

// PUT /advertisements/:id
advertisementRoutes.put('/updateAdd/:id', updateAdvertisement);

// DELETE /advertisements/:id
advertisementRoutes.delete('/deleteAdd/:id', deleteAdvertisement);

module.exports = advertisementRoutes;
