const express =  require("express");
const Advertisement = require('../models/Advertisement');
const { successResponse, errorResponse } = require("../helper/successAndError");
const { uploadAdvertisementImage, handleUploadError, deleteOldImage, getRelativePath } = require("../middleware/upload");

// Create new advertisement
exports.createAdvertisement = async (req, res) => {
  try {
    const data = req.body;

    // Handle image upload
    if (req.file) {
      data.image = getRelativePath(req.file.path);
    }

    const advertisement = new Advertisement(data);
    await advertisement.save();
    res.status(201).json(successResponse(201, "Advertisement created successfully", advertisement));
  } catch (error) {
    res.status(400).json(errorResponse(400, "Failed to create advertisement", error.message));
  }
};

// Get all advertisements (with optional filters)
exports.getAllAdvertisements = async (req, res) => {
  try {
    const advertisements = await Advertisement.find()
      .populate('business', 'name owner')
      .sort({ createdAt: -1 });
    res.status(200).json(successResponse(200, "Advertisements retrieved successfully", advertisements));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to retrieve advertisements", error.message));
  }
};

// Get single advertisement by ID
exports.getAdvertisementById = async (req, res) => {
  try {
    const id = req.params.id;
    const advertisement = await Advertisement.findById(id)
      .populate('business', 'name owner');
    if (!advertisement) return res.status(404).json(errorResponse(404, 'Advertisement not found'));
    res.status(200).json(successResponse(200, "Advertisement retrieved successfully", advertisement));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to retrieve advertisement", error.message));
  }
};

// Update advertisement by ID
exports.updateAdvertisement = async (req, res) => {
  try {
    const updateData = req.body;

    // Handle image upload
    if (req.file) {
      // Get the current advertisement to check for existing image
      const currentAdvertisement = await Advertisement.findById(req.params.id);
      if (currentAdvertisement && currentAdvertisement.image) {
        // Delete old image file
        deleteOldImage(currentAdvertisement.image);
      }
      updateData.image = getRelativePath(req.file.path);
    }

    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('business', 'name owner');
    
    if (!advertisement) return res.status(404).json(errorResponse(404, 'Advertisement not found'));
    res.status(200).json(successResponse(200, "Advertisement updated successfully", advertisement));
  } catch (error) {
    res.status(400).json(errorResponse(400, "Failed to update advertisement", error.message));
  }
};

// Delete advertisement by ID
exports.deleteAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) return res.status(404).json(errorResponse(404, 'Advertisement not found'));

    // Delete associated image file if exists
    if (advertisement.image) {
      deleteOldImage(advertisement.image);
    }

    await Advertisement.findByIdAndDelete(req.params.id);
    res.status(200).json(successResponse(200, 'Advertisement deleted successfully'));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to delete advertisement", error.message));
  }
};

// Upload advertisement image
exports.uploadAdvertisementImage = async (req, res) => {
  try {
    const advertisementId = req.params.id;

    if (!req.file) {
      return res.status(400).json(errorResponse(400, "No image file provided"));
    }

    // Get the advertisement
    const advertisement = await Advertisement.findById(advertisementId);
    if (!advertisement) {
      return res.status(404).json(errorResponse(404, "Advertisement not found"));
    }

    // Delete old image if exists
    if (advertisement.image) {
      deleteOldImage(advertisement.image);
    }

    // Update advertisement with new image
    advertisement.image = getRelativePath(req.file.path);
    await advertisement.save();

    res.status(200).json(successResponse(200, "Advertisement image uploaded successfully", {
      advertisementId: advertisement._id,
      imagePath: advertisement.image
    }));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to upload advertisement image", error.message));
  }
};
