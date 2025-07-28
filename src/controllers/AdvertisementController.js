const express =  require("express");
const Advertisement = require('../models/Advertisement');

// Create new advertisement
exports.createAdvertisement = async (req, res) => {
  try {
    const advertisement = new Advertisement(req.body);
    await advertisement.save();
    res.status(201).json(advertisement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all advertisements (with optional filters)
exports.getAllAdvertisements = async (req, res) => {
  try {
    const advertisements = await Advertisement.find();
    res.status(200).json(advertisements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single advertisement by ID
exports.getAdvertisementById = async (req, res) => {
  try {
    const id = req.params.id;
    const advertisement = await Advertisement.findById(id);
    if (!advertisement) return res.status(404).json({ message: 'Advertisement not found' });
    res.status(200).json(advertisement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update advertisement by ID
exports.updateAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!advertisement) return res.status(404).json({ message: 'Advertisement not found' });
    res.status(200).json(advertisement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete advertisement by ID
exports.deleteAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndDelete(req.params.id);
    if (!advertisement) return res.status(404).json({ message: 'Advertisement not found' });
    res.status(200).json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
