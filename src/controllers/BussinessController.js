const mongoose = require("mongoose");
const BussinessModel = require("../models/Business");
const { errorResponse, successResponse } = require("../helper/successAndError");
const UserModel = require("../models/User"); // adjust path accordingly
const NotificationModel = require("../models/Notification");
const { sendPushNotification } = require("../utils/sendPushNotification");

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

    // Set approval status to pending for new businesses
    data.approvalStatus = 'pending';
    data.isActive = false; // Business is inactive until approved

    // Create new business
    const newBusiness = new BussinessModel(data);
    await newBusiness.save();

    // Find all admin users to send notification
    const adminUsers = await UserModel.find({ role: 'admin' });
    
    // Create notifications for all admins
    const notifications = adminUsers.map(admin => ({
      title: 'New Business Approval Required',
      message: `A new business "${data.name}" has been submitted and requires approval.`,
      type: 'business_approval',
      recipient: admin._id,
      business: newBusiness._id,
      data: {
        businessId: newBusiness._id,
        businessName: data.name,
        ownerId: data.owner
      }
    }));

    await NotificationModel.insertMany(notifications);

    // Send push notifications to admins
    for (const admin of adminUsers) {
      if (admin.subscription && admin.subscription.endpoint) {
        const payload = {
          title: 'New Business Approval Required',
          body: `A new business "${data.name}" has been submitted and requires approval.`,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: {
            businessId: newBusiness._id,
            type: 'business_approval'
          }
        };
        
        await sendPushNotification(admin.subscription, payload);
      }
    }

    // Populate references
    await newBusiness.populate([
      { path: "category", select: "_id name" },
      { path: "owner", select: "_id name" },
      { path: "subCategory", select: "_id name" },
    ]);

    return res
      .status(200)
      .json(successResponse(200, "Business submitted for approval", newBusiness));
  } catch (error) {
    return res
      .status(500)
      .json(errorResponse(500, "Something went wrong", error.message));
  }
};



module.exports.getBussiness = async (req, res) => {
  try {
    // Only show approved and active businesses to regular users
    const getBussiness = await BussinessModel.find({ 
      approvalStatus: 'approved',
      isActive: true,
      status: 'active'
    })
    .populate('category', 'name')
    .populate('subCategory', 'name')
    .populate('owner', 'name email phone');
    
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
    
    // Check if status is being updated and validate it
    if (query.status && !['active', 'inactive', 'blocked'].includes(query.status)) {
      return res.status(400).json(errorResponse(400, 'Invalid status. Must be active, inactive, or blocked'));
    }
    
    const updatedBuss = await BussinessModel.findByIdAndUpdate(id, query, {
      new: true,
      runValidators: true,
    });
    
    if (!updatedBuss) {
      return res.status(404).json(errorResponse(404, 'Business not found'));
    }
    
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

    const myBuss = await BussinessModel.find({ owner: userId})
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('approvedBy', 'name email');

    if (!myBuss || myBuss.length === 0) {
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
  const filter = {
    // Only show approved and active businesses in search
    approvalStatus: 'approved',
    isActive: true,
    status: 'active'
  };

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
    const business = await BussinessModel.find(filter)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('owner', 'name email phone');

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

    // Get full user data
    const user = await UserModel.findById(userId).select("name email phone_number isActive");

    if (!user) {
      return res.status(404).json(errorResponse(404, "User not found"));
    }

    // Embed user data (instead of just ID) into lead array
    const business = await BussinessModel.findByIdAndUpdate(
      businessId,
      {
        $addToSet: {
          lead: {
            _id: user._id, // still keep reference
            name: user.name,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive,
          }
        }
      },
      { new: true, runValidators: true }
    );

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

// Admin function to approve business
module.exports.approveBusiness = async (req, res) => {
  try {
    const businessId = req.params.id;
    const adminId = req.userId; // From authentication middleware

    const business = await BussinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json(errorResponse(404, "Business not found"));
    }

    if (business.approvalStatus !== 'pending') {
      return res.status(400).json(errorResponse(400, "Business is not pending approval"));
    }

    // Update business status
    business.approvalStatus = 'approved';
    business.approvedBy = adminId;
    business.approvedAt = new Date();
    business.isActive = true;
    business.status = 'active';
    await business.save();

    // Create notification for business owner
    const ownerNotification = new NotificationModel({
      title: 'Business Approved',
      message: `Your business "${business.name}" has been approved and is now active.`,
      type: 'business_approval',
      recipient: business.owner,
      sender: adminId,
      business: businessId,
      data: {
        businessId: businessId,
        businessName: business.name,
        approvedBy: adminId
      }
    });
    await ownerNotification.save();

    // Send push notification to business owner
    const owner = await UserModel.findById(business.owner);
    if (owner && owner.subscription && owner.subscription.endpoint) {
      const payload = {
        title: 'Business Approved',
        body: `Your business "${business.name}" has been approved and is now active.`,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          businessId: businessId,
          type: 'business_approved'
        }
      };
      
      await sendPushNotification(owner.subscription, payload);
    }

    res.status(200).json(successResponse(200, "Business approved successfully", business));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to approve business", error.message));
  }
};

// Admin function to reject business
module.exports.rejectBusiness = async (req, res) => {
  try {
    const businessId = req.params.id;
    const adminId = req.userId;  // still works
    // but also you can check role
    if (req.userRole !== "admin") {
      return res.status(403).json(errorResponse(403, "Forbidden - Admin access required"));
    }
        const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json(errorResponse(400, "Rejection reason is required"));
    }

    const business = await BussinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json(errorResponse(404, "Business not found"));
    }

    if (business.approvalStatus !== 'pending') {
      return res.status(400).json(errorResponse(400, "Business is not pending approval"));
    }

    // Update business status
    business.approvalStatus = 'rejected';
    business.approvedBy = adminId;
    business.approvedAt = new Date();
    business.rejectionReason = rejectionReason;
    business.isActive = false;
    business.status = 'inactive';
    await business.save();

    // Create notification for business owner
    const ownerNotification = new NotificationModel({
      title: 'Business Rejected',
      message: `Your business "${business.name}" has been rejected. Reason: ${rejectionReason}`,
      type: 'business_rejection',
      recipient: business.owner,
      sender: adminId,
      business: businessId,
      data: {
        businessId: businessId,
        businessName: business.name,
        rejectionReason: rejectionReason,
        rejectedBy: adminId
      }
    });
    await ownerNotification.save();

    // Send push notification to business owner
    const owner = await UserModel.findById(business.owner);
    if (owner && owner.subscription && owner.subscription.endpoint) {
      const payload = {
        title: 'Business Rejected',
        body: `Your business "${business.name}" has been rejected. Reason: ${rejectionReason}`,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          businessId: businessId,
          type: 'business_rejected'
        }
      };
      
      await sendPushNotification(owner.subscription, payload);
    }

    res.status(200).json(successResponse(200, "Business rejected successfully", business));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to reject business", error.message));
  }
};

// Get pending businesses for admin
module.exports.getPendingBusinesses = async (req, res) => {
  try {
    const pendingBusinesses = await BussinessModel.find({ approvalStatus: 'pending' })
      .populate('owner', 'name email phone')
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .sort({ submittedAt: -1 });

    res.status(200).json(successResponse(200, "Pending businesses fetched", pendingBusinesses));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to fetch pending businesses", error.message));
  }
};

// Get business approval history
module.exports.getBusinessApprovalHistory = async (req, res) => {
  try {
    const businesses = await BussinessModel.find({ 
      approvalStatus: { $in: ['approved', 'rejected'] } 
    })
      .populate('owner', 'name email phone')
      .populate('approvedBy', 'name email')
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .sort({ approvedAt: -1 });

    res.status(200).json(successResponse(200, "Business approval history fetched", businesses));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to fetch approval history", error.message));
  }
};

// Admin function to get all businesses (regardless of approval status)
module.exports.getAllBussiness = async (req, res) => {
  try {
    const bussinessDetail = await BussinessModel.find();
    res.status(200).json({
        success: true,
        message: 'Bussiness data is fetched successfully',
        data: bussinessDetail
    });
} catch (error) {
    res.status(500).json({
        success: false,
        message: 'Category not found',
        error: error.message
    });
}
};



