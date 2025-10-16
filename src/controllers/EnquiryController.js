const EnquiryModel = require("../models/Enquiry");
const BusinessModel = require("../models/Business");
const NotificationModel = require("../models/Notification");
const CategoryModel = require("../models/Category");
const SubCategoryModel = require("../models/SubCategory");
const UserModel = require("../models/User");
const { successResponse, errorResponse } = require("../helper/successAndError");

// Submit new enquiry
module.exports.submitEnquiry = async (req, res) => {
  try {
    const userId = req.userId;
    const { description, category, subCategory } = req.body;

    // Validation
    if (!description || !category || !subCategory) {
      return res.status(400).json(errorResponse(400, "Description, category, and subCategory are required"));
    }

    // Verify category and subcategory exist
    const categoryExists = await CategoryModel.findById(category);
    const subCategoryExists = await SubCategoryModel.findById(subCategory);
    
    if (!categoryExists || !subCategoryExists) {
      return res.status(400).json(errorResponse(400, "Invalid category or subcategory"));
    }

    // Create enquiry
    const enquiry = new EnquiryModel({
      user: userId,
      description,
      category,
      subCategory
    });

    await enquiry.save();

    // Find all businesses related to this category/subcategory
    const targetBusinesses = await BusinessModel.find({
      $or: [
        { category: category },
        { subCategory: subCategory }
      ],
      isActive: true,
      approvalStatus: 'approved'
    }).populate('owner', 'name email phone');

    // Get user details for notification
    const userDetails = await UserModel.findById(userId).select('name phone');

    // Send notifications to all target businesses
    const notificationPromises = targetBusinesses.map(async (business) => {
      const notification = new NotificationModel({
        title: `New Enquiry Received`,
        message: `A new enquiry has been submitted for ${subCategoryExists.name} by ${userDetails.name} (${userDetails.phone}). ${description.substring(0, 100)}...`,
        type: 'enquiry_received',
        recipient: business.owner._id,
        sender: userId,
        business: business._id,
        data: {
          enquiryId: enquiry._id,
          category: categoryExists.name,
          subCategory: subCategoryExists.name,
          userName: userDetails.name,
          userPhone: userDetails.phone
        }
      });

      return await notification.save();
    });

    await Promise.all(notificationPromises);

    res.status(201).json(successResponse(201, "Enquiry submitted successfully", {
      enquiry,
      notificationsSent: targetBusinesses.length,
      targetBusinesses: targetBusinesses.map(b => ({
        id: b._id,
        name: b.name,
        owner: b.owner.name
      }))
    }));

  } catch (error) {
    console.error('Submit enquiry error:', error);
    res.status(500).json(errorResponse(500, "Failed to submit enquiry", error.message));
  }
};

// Get enquiries for a business owner
module.exports.getBusinessEnquiries = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    // Get user's businesses
    const userBusinesses = await BusinessModel.find({ owner: userId });

    // Build filter - find enquiries for categories/subcategories that match user's businesses
    const filter = {
      $or: [
        { category: { $in: userBusinesses.map(b => b.category) } },
        { subCategory: { $in: userBusinesses.map(b => b.subCategory) } }
      ]
    };

    // Get enquiries with pagination
    const enquiries = await EnquiryModel.find(filter)
      .populate('user', 'name phone')
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EnquiryModel.countDocuments(filter);

    res.status(200).json(successResponse(200, "Business enquiries fetched successfully", {
      enquiries,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        limit: parseInt(limit)
      }
    }));

  } catch (error) {
    console.error('Get business enquiries error:', error);
    res.status(500).json(errorResponse(500, "Failed to fetch business enquiries", error.message));
  }
};

// Respond to an enquiry
module.exports.respondToEnquiry = async (req, res) => {
  try {
    const userId = req.userId;
    const { enquiryId } = req.params;
    const { message, contactInfo } = req.body;

    if (!message) {
      return res.status(400).json(errorResponse(400, "Response message is required"));
    }

    // Get user's business
    const userBusiness = await BusinessModel.findOne({ owner: userId });
    if (!userBusiness) {
      return res.status(404).json(errorResponse(404, "Business not found"));
    }

    // Get enquiry
    const enquiry = await EnquiryModel.findById(enquiryId);
    if (!enquiry) {
      return res.status(404).json(errorResponse(404, "Enquiry not found"));
    }

    // Send notification to enquiry submitter
    const notification = new NotificationModel({
      title: `Response to your enquiry`,
      message: `Your enquiry has received a response from ${userBusiness.name}. ${message.substring(0, 100)}...`,
      type: 'enquiry_response',
      recipient: enquiry.user,
      sender: userId,
      business: userBusiness._id,
      data: {
        enquiryId: enquiry._id,
        businessName: userBusiness.name,
        responseMessage: message
      }
    });

    await notification.save();

    res.status(200).json(successResponse(200, "Response submitted successfully", {
      enquiry,
      response: {
        business: userBusiness.name,
        message,
        contactInfo,
        respondedAt: new Date()
      }
    }));

  } catch (error) {
    console.error('Respond to enquiry error:', error);
    res.status(500).json(errorResponse(500, "Failed to respond to enquiry", error.message));
  }
};

// Get user's submitted enquiries
module.exports.getUserEnquiries = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const filter = { user: userId };

    const enquiries = await EnquiryModel.find(filter)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EnquiryModel.countDocuments(filter);

    res.status(200).json(successResponse(200, "User enquiries fetched successfully", {
      enquiries,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        limit: parseInt(limit)
      }
    }));

  } catch (error) {
    console.error('Get user enquiries error:', error);
    res.status(500).json(errorResponse(500, "Failed to fetch user enquiries", error.message));
  }
};

// Get enquiry details
module.exports.getEnquiryDetails = async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const userId = req.userId;

    const enquiry = await EnquiryModel.findById(enquiryId)
      .populate('user', 'name phone')
      .populate('category', 'name')
      .populate('subCategory', 'name');

    if (!enquiry) {
      return res.status(404).json(errorResponse(404, "Enquiry not found"));
    }

    // Check if user has access to this enquiry
    const userBusinesses = await BusinessModel.find({ owner: userId });
    const hasAccess = enquiry.user.toString() === userId || 
      userBusinesses.some(b => 
        b.category.toString() === enquiry.category._id.toString() || 
        b.subCategory.toString() === enquiry.subCategory._id.toString()
      );

    if (!hasAccess) {
      return res.status(403).json(errorResponse(403, "Access denied to this enquiry"));
    }

    res.status(200).json(successResponse(200, "Enquiry details fetched successfully", enquiry));

  } catch (error) {
    console.error('Get enquiry details error:', error);
    res.status(500).json(errorResponse(500, "Failed to fetch enquiry details", error.message));
  }
};

