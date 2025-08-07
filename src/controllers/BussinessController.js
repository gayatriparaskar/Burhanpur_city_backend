const mongoose = require("mongoose");
const BussinessModel = require("../models/Business");
const { errorResponse, successResponse } = require("../helper/successAndError");

const SubCategoryModel = require("../models/SubCategory"); // Adjust path as needed

module.exports.createBussiness = async (req, res) => {
  try {
    const data = req.body;

    // Trim business name
    const name = data.name.trim();
    data.name = name;

    // Validate category presence
    if (!data.category) {
      return res.status(400).json(errorResponse(400, "Category is required"));
    }

    // Handle subCategory - either as ID or name
    if (!data.subCategory) {
      return res.status(400).json(errorResponse(400, "subCategory is required"));
    }

    let subCategoryId;

    // If it's not a valid ObjectId, treat as name
    const isValidObjectId = mongoose.Types.ObjectId.isValid(data.subCategory);
    if (!isValidObjectId) {
      // Find or create subcategory by name
      let subCategoryDoc = await SubCategoryModel.findOne({
        name: data.subCategory.trim(),
        category: data.category,
      });

      if (!subCategoryDoc) {
        subCategoryDoc = new SubCategoryModel({
          name: data.subCategory.trim(),
          category: data.category,
        });
        await subCategoryDoc.save();
      }

      subCategoryId = subCategoryDoc._id;
    } else {
      // If it's a valid ObjectId, confirm it exists
      const subCategoryDoc = await SubCategoryModel.findById(data.subCategory);
      if (!subCategoryDoc) {
        return res.status(400).json(errorResponse(400, "Invalid subCategory ID"));
      }

      subCategoryId = subCategoryDoc._id;
    }

    data.subCategory = subCategoryId;

    // Check for existing business in same subCategory
    const existingBusiness = await BussinessModel.findOne({
      name: data.name,
      subCategory: data.subCategory,
    }).collation({ locale: "en", strength: 2 });

    if (existingBusiness) {
      return res
        .status(409)
        .json(errorResponse(409, "Business already exists", existingBusiness));
    }

    // Create new business
    const newBusiness = new BussinessModel(data);
    await newBusiness.save();

    // Populate references
    await newBusiness.populate([
      { path: "category", select: "_id name" },
      { path: "owner", select: "_id name" },
      { path: "subCategory", select: "_id name" },
    ]);

    return res
      .status(200)
      .json(successResponse(200, "Business added successfully", newBusiness));
  } catch (error) {
    return res
      .status(500)
      .json(errorResponse(500, "Something went wrong", error.message));
  }
};



module.exports.getBussiness = async (req, res) => {
  try {
    const getBussiness = await BussinessModel.find();
    res
      .status(200)
      .json(successResponse(200, "Get Bussiness model", getBussiness));
  } catch (error) {
    res
      .status(500)
      .json(errorResponse(500, error.message || "Invalid Credentials"));
  }
};

module.exports.getBussinessById = async (req, res) => {
  try {
    const userId = req.params.id;

    const businesses = await BussinessModel.find({ owner: userId })
      .populate("category", "id name")
      .populate("subCategory", "id name");

        if (businesses.length === 0) {
      return res
        .status(404)
        .json(errorResponse(404, "User has not registered any business"));
    }
    
    res
      .status(200)
      .json(successResponse(200, "Businesses created by user", businesses));
  } catch (error) {
    res
      .status(500)
      .json(errorResponse(500, error.message || "Something went wrong"));
  }
};


module.exports.updateBussiness = async (req, res) => {
  try {
    const id = req.params.id;
    const query = req.body;
    const updatedBuss = await BussinessModel.findByIdAndUpdate(id, query, {
      new: true,
      runValidators: true,
    });
    res
      .status(200)
      .json(successResponse(200, "Bussiness is updated", updatedBuss));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Invalid Credentials"));
  }
};

module.exports.deletedBuss = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedBuss = await BussinessModel.findByIdAndDelete(id);
    res
      .status(200)
      .json(
        successResponse(200, "Bussiness is deleted successfully", deletedBuss)
      );
  } catch (error) {
    res.status(500).json(errorResponse(500, "Invalid Credentials"));
  }
};

module.exports.getMyBuss = async (req, res) => {
  try {
    const userId = req.userId; // ✅ from auth middleware

    const myBuss = await BussinessModel.find({ owner: userId});

    if (!myBuss) {
      return res
        .status(404)
        .json(errorResponse(404, "Business not found for this user"));
    }

    res.status(200).json(
      successResponse(200, "My business fetched successfully", myBuss)
    );
  } catch (error) {
    res
      .status(500)
      .json(errorResponse(500, "Failed to fetch business", error.message));
  }
};

module.exports.searchBuss = async (req, res) => {
  const { query, isActive } = req.query;
  const filter = {};

  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { speciality: { $regex: query, $options: 'i' } },
      { features: { $elemMatch: { $regex: query, $options: 'i' } } },
      { keyWords: { $elemMatch: { $regex: query, $options: 'i' } } }
    ];
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  try {
    const business = await BussinessModel.find(filter);

    if (business.length === 0) {
      return res
        .status(200)
        .json(successResponse(200, "No businesses found matching the search criteria"));
    }

    return res
      .status(200)
      .json(successResponse(200, "Filtered business data found", business));
  } catch (error) {
    return res
      .status(500)
      .json(errorResponse(500, "Server error", error.message));
  }
};

module.exports.getBusinessStats = async (req, res) => {
  try {
    const totalBusinesses = await BussinessModel.countDocuments();

    const verifiedBusinesses = await BussinessModel.countDocuments({ isVerified: true });
    const activeBusinesses = await BussinessModel.countDocuments({ isActive: true });

    const totalRevenue = await BussinessModel.aggregate([
      { $group: { _id: null, total: { $sum: "$revenue" } } }
    ]);

    const averageConversion = await BussinessModel.aggregate([
      { $group: { _id: null, average: { $avg: "$conversionRate" } } }
    ]);

    const businessesPerMonth = await BussinessModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.status(200).json(successResponse(200, "Business analytics fetched", {
      totalBusinesses,
      verifiedBusinesses,
      activeBusinesses,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageConversionRate: averageConversion[0]?.average?.toFixed(2) || 0,
      businessesPerMonth
    }));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to fetch stats", error.message));
  }
};

module.exports.getSingleBusinessStats = async (req, res) => {
  try {
    const id = req.params.id; // Business ID from URL

    const business = await BussinessModel.findById(id);

    if (!business) {
      return res.status(404).json(errorResponse(404, "Business not found"));
    }

    const stats = {
      name: business.name,
      isVerified: business.isVerified,
      isActive: business.isActive,
      revenue: business.revenue,
      conversionRate: business.conversionRate,
      activeLeads: business.activeLeads,
      createdAt: business.createdAt,
    };

    return res.status(200).json(successResponse(200, "Business analytics fetched", stats));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to fetch business stats", error.message));
  }
};

module.exports.addLeadToBusiness = async (req, res) => {
  try {
    const businessId = req.params.id;
    const { userId } = req.body;

    const business = await BussinessModel.findByIdAndUpdate(
      businessId,
      { $addToSet: { lead: userId } }, // avoids duplicates
      { new: true, runValidators: true }
    ).populate("lead", "name email phone isActive ");

    if (!business) {
      return res.status(404).json(errorResponse(404, "Business not found"));
    }

    // Update activeLeads count
    business.activeLeads = business.lead.length;
    // await business.save();

    res.status(200).json(successResponse(200, "Lead added successfully", business));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to add lead", error.message));
  }
};

