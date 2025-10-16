const mongoose = require("mongoose");
const BussinessModel = require("../models/Business");
const { errorResponse, successResponse } = require("../helper/successAndError");
const UserModel = require("../models/User"); // adjust path accordingly
const NotificationModel = require("../models/Notification");
const { sendPushNotification, sendBulkPushNotifications } = require("../utils/sendPushNotification");
const { uploadBusinessImage, handleUploadError, deleteOldImage, getRelativePath } = require("../middleware/upload");
// const OTPModel = require("../models/OTP"); // Commented out OTP logic

const SubCategoryModel = require("../models/SubCategory"); // Adjust path as needed

// Create business with OTP verification
// module.exports.createBusinessWithOTP = async (req, res) => {
//   try {
//     const data = req.body;
//     const { phone, otp } = data;

//     // Validate required fields
//     if (!phone || !otp) {
//       return res.status(400).json(errorResponse(400, "Phone number and OTP are required"));
//     }

//     // Validate phone number format
//     if (!/^\d{10}$/.test(phone)) {
//       return res.status(400).json(errorResponse(400, "Valid 10-digit phone number is required"));
//     }

//     // Validate OTP format
//     if (!/^\d{6}$/.test(otp)) {
//       return res.status(400).json(errorResponse(400, "Valid 6-digit OTP is required"));
//     }

//     // Verify OTP
//     const otpRecord = await OTPModel.findOne({
//       phone,
//       purpose: 'business_registration',
//       isVerified: false,
//       expiresAt: { $gt: new Date() }
//     });

//     if (!otpRecord) {
//       return res.status(404).json(errorResponse(404, "OTP not found or expired. Please request a new OTP."));
//     }

//     // Check if max attempts reached
//     if (otpRecord.hasMaxAttempts()) {
//       return res.status(429).json(errorResponse(429, "Maximum OTP attempts reached. Please request a new OTP."));
//     }

//     // Verify OTP
//     const bcrypt = require('bcrypt');
//     const isOtpValid = await bcrypt.compare(otp, otpRecord.hashedOtp);

//     if (!isOtpValid) {
//       // Increment attempts
//       await otpRecord.incrementAttempts();
      
//       const remainingAttempts = 3 - otpRecord.attempts;
//       return res.status(400).json(errorResponse(400, `Invalid OTP. ${remainingAttempts} attempts remaining`));
//     }

//     // Mark OTP as verified
//     await otpRecord.markAsVerified();

//     // Continue with business creation (same logic as createBussiness)
//     return await createBusinessLogic(req, res, data);
//   } catch (error) {
//     console.error('Create business with OTP error:', error);
//     return res.status(500).json(errorResponse(500, "Failed to create business with OTP verification", error.message));
//   }
// };

// Original createBussiness function (now calls the logic function)
module.exports.createBussiness = async (req, res) => {
  try {
    const data = req.body;

    // Debug logging to help identify the issue
    console.log('Request body:', data);
    console.log('Request files:', req.file);

    // Handle image upload
    if (req.file) {
      data.images = getRelativePath(req.file.path);
    }

    return await createBusinessLogic(req, res, data);
  } catch (error) {
    return res.status(500).json(errorResponse(500, "Something went wrong", error.message));
  }
};

// Common business creation logic
const createBusinessLogic = async (req, res, data) => {
  try {
    // Handle image upload
    if (req.file) {
      data.images = getRelativePath(req.file.path);
    }

    // Validate required fields first
    if (!data.name || typeof data.name !== 'string') {
      return res.status(400).json(errorResponse(400, "Business name is required and must be a string"));
    }

    // Trim business name
    const name = data.name.trim();
    if (!name) {
      return res.status(400).json(errorResponse(400, "Business name cannot be empty"));
    }
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
    console.log(`🔍 Found ${adminUsers.length} admin users in database`);
    
    if (adminUsers.length > 0) {
      try {
        // Create notifications for all admins
        const notifications = adminUsers.map(admin => ({
          title: 'New Business Approval Required',
          message: `A new business "${data.name}" has been submitted and requires approval.`,
          type: 'business_submission',
          recipient: admin._id,
          business: newBusiness._id,
          data: {
            businessId: newBusiness._id,
            businessName: data.name,
            ownerId: data.owner
          }
        }));

        await NotificationModel.insertMany(notifications);
        console.log(`✅ Created ${notifications.length} notifications for admins`);

        // Send real-time push notifications to all admins
        const adminSubscriptions = adminUsers
          .filter(admin => admin.subscription && admin.subscription.endpoint)
          .map(admin => admin.subscription);
        
        if (adminSubscriptions.length > 0) {
          const payload = {
            title: '🚨 New Business Approval Required',
            body: `A new business "${data.name}" has been submitted and requires immediate approval.`,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            requireInteraction: true, // Keep notification visible until user interacts
            actions: [
              {
                action: 'approve',
                title: 'Approve',
                icon: '/approve-icon.png'
              },
              {
                action: 'reject', 
                title: 'Reject',
                icon: '/reject-icon.png'
              }
            ],
            data: {
              businessId: newBusiness._id,
              businessName: data.name,
              ownerId: data.owner,
              type: 'business_submission',
              url: `/admin/business/${newBusiness._id}`,
              timestamp: new Date().toISOString()
            }
          };
          
          try {
            console.log(`🚀 Sending real-time push notifications to ${adminSubscriptions.length} admins...`);
            const pushResults = await sendBulkPushNotifications(adminSubscriptions, payload);
            
            const successCount = pushResults.filter(r => r.result.success).length;
            const failureCount = pushResults.filter(r => !r.result.success).length;
            
            console.log(`✅ Real-time push notifications sent: ${successCount} successful, ${failureCount} failed`);
            
            // Log individual results
            pushResults.forEach((result, index) => {
              if (result.result.success) {
                console.log(`✅ Admin ${index + 1}: Push notification delivered`);
              } else {
                console.error(`❌ Admin ${index + 1}: ${result.result.error}`);
              }
            });
          } catch (bulkPushError) {
            console.error('❌ Bulk push notification failed:', bulkPushError);
          }
        } else {
          console.log('⚠️ No admin users have push notification subscriptions');
        }
      } catch (notificationError) {
        console.error('❌ Error creating notifications:', notificationError);
        // Don't fail the business creation if notifications fail
      }
    } else {
      console.log('⚠️ No admin users found to send notifications to');
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
    const updateData = req.body;
    const userId = req.userId; // From authentication middleware
    const userRole = req.userRole; // From authentication middleware

    // Handle image upload
    if (req.file) {
      // Get the current business to check for existing image
      const currentBusiness = await BussinessModel.findById(id);
      if (currentBusiness && currentBusiness.images) {
        // Delete old image file
        deleteOldImage(currentBusiness.images);
      }
      updateData.images = getRelativePath(req.file.path);
    }
    
    // Get the business first to check ownership
    const business = await BussinessModel.findById(id);
    if (!business) {
      return res.status(404).json(errorResponse(404, 'Business not found'));
    }
    
    // Check permissions
    const isOwner = business.owner.toString() === userId;
    const isAdmin = userRole === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json(errorResponse(403, 'Access denied. You can only update your own business or need admin privileges.'));
    }
    
    // Define restricted fields based on role
    const adminOnlyFields = ['approvalStatus', 'approvedBy', 'approvedAt', 'rejectionReason', 'isActive'];
    const ownerRestrictedFields = ['approvalStatus', 'approvedBy', 'approvedAt', 'rejectionReason'];
    
    // Check if owner is trying to update admin-only fields
    if (isOwner && !isAdmin) {
      const restrictedFields = Object.keys(updateData).filter(field => ownerRestrictedFields.includes(field));
      if (restrictedFields.length > 0) {
        return res.status(403).json(errorResponse(403, `You cannot update these fields: ${restrictedFields.join(', ')}. Admin access required.`));
      }
    }
    
    // Check if non-admin is trying to update admin-only fields
    if (!isAdmin) {
      const adminFields = Object.keys(updateData).filter(field => adminOnlyFields.includes(field));
      if (adminFields.length > 0) {
        return res.status(403).json(errorResponse(403, `You cannot update these fields: ${adminFields.join(', ')}. Admin access required.`));
      }
    }
    
    // Validate status field
    if (updateData.status && !['active', 'inactive', 'blocked'].includes(updateData.status)) {
      return res.status(400).json(errorResponse(400, 'Invalid status. Must be active, inactive, or blocked'));
    }
    
    // Admin-specific logic for approval status changes
    if (isAdmin && updateData.approvalStatus && updateData.approvalStatus !== business.approvalStatus) {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
      
      // Set related fields based on approval status
      if (updateData.approvalStatus === 'approved') {
        updateData.isActive = true;
        updateData.status = 'active';
      } else if (updateData.approvalStatus === 'rejected') {
        updateData.isActive = false;
        updateData.status = 'inactive';
      }
    }
    
    // Update the business
    const updatedBusiness = await BussinessModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name email phone')
     .populate('category', 'name')
     .populate('subCategory', 'name')
     .populate('approvedBy', 'name email');
    
    // Send notification to business owner if admin changed approval status
    if (isAdmin && updateData.approvalStatus && updateData.approvalStatus !== business.approvalStatus) {
      const owner = await UserModel.findById(business.owner);
      
      let notificationTitle, notificationMessage, pushTitle, pushBody;
      
      if (updateData.approvalStatus === 'approved') {
        notificationTitle = 'Business Approved';
        notificationMessage = `Your business "${business.name}" has been approved and is now active.`;
        pushTitle = 'Business Approved';
        pushBody = `Your business "${business.name}" has been approved and is now active.`;
      } else if (updateData.approvalStatus === 'rejected') {
        notificationTitle = 'Business Rejected';
        notificationMessage = `Your business "${business.name}" has been rejected. Reason: ${updateData.rejectionReason || 'No reason provided'}`;
        pushTitle = 'Business Rejected';
        pushBody = `Your business "${business.name}" has been rejected. Reason: ${updateData.rejectionReason || 'No reason provided'}`;
      }

      // Create notification
      const ownerNotification = new NotificationModel({
        title: notificationTitle,
        message: notificationMessage,
        type: updateData.approvalStatus === 'approved' ? 'business_approval' : 'business_rejection',
        recipient: business.owner,
        sender: userId,
        business: id,
        data: {
          businessId: id,
          businessName: business.name,
          approvedBy: userId,
          rejectionReason: updateData.rejectionReason
        }
      });
      await ownerNotification.save();

      // Send push notification
      if (owner && owner.subscription && owner.subscription.endpoint) {
        const payload = {
          title: pushTitle,
          body: pushBody,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: {
            businessId: id,
            type: updateData.approvalStatus === 'approved' ? 'business_approved' : 'business_rejected'
          }
        };
        
        await sendPushNotification(owner.subscription, payload);
      }
    }
    
    const message = isAdmin ? "Business updated successfully by admin" : "Business updated successfully";
    res.status(200).json(successResponse(200, message, updatedBusiness));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to update business", error.message));
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
    const { userId, message } = req.body;

    // Get full user data
    const user = await UserModel.findById(userId).select("name email phone isActive");

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
            message: message || "" // Add message field
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

// Admin function to update entire business (including approval fields)
module.exports.adminUpdateBusiness = async (req, res) => {
  try {
    const businessId = req.params.id;
    const updateData = req.body;
    const adminId = req.userId; // From authentication middleware

    // Handle image upload
    if (req.file) {
      // Get the current business to check for existing image
      const currentBusiness = await BussinessModel.findById(businessId);
      if (currentBusiness && currentBusiness.images) {
        // Delete old image file
        deleteOldImage(currentBusiness.images);
      }
      updateData.images = getRelativePath(req.file.path);
    }

    // Validate business exists
    const business = await BussinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json(errorResponse(404, "Business not found"));
    }

    // If approval status is being changed, add audit trail
    if (updateData.approvalStatus && updateData.approvalStatus !== business.approvalStatus) {
      updateData.approvedBy = adminId;
      updateData.approvedAt = new Date();
      
      // Set related fields based on approval status
      if (updateData.approvalStatus === 'approved') {
        updateData.isActive = true;
        updateData.status = 'active';
      } else if (updateData.approvalStatus === 'rejected') {
        updateData.isActive = false;
        updateData.status = 'inactive';
      }
    }

    // Update the business
    const updatedBusiness = await BussinessModel.findByIdAndUpdate(
      businessId, 
      updateData, 
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('owner', 'name email phone')
     .populate('category', 'name')
     .populate('subCategory', 'name')
     .populate('approvedBy', 'name email');

    // Send notification to business owner if approval status changed
    if (updateData.approvalStatus && updateData.approvalStatus !== business.approvalStatus) {
      const owner = await UserModel.findById(business.owner);
      
      let notificationTitle, notificationMessage, pushTitle, pushBody;
      
      if (updateData.approvalStatus === 'approved') {
        notificationTitle = 'Business Approved';
        notificationMessage = `Your business "${business.name}" has been approved and is now active.`;
        pushTitle = 'Business Approved';
        pushBody = `Your business "${business.name}" has been approved and is now active.`;
      } else if (updateData.approvalStatus === 'rejected') {
        notificationTitle = 'Business Rejected';
        notificationMessage = `Your business "${business.name}" has been rejected. Reason: ${updateData.rejectionReason || 'No reason provided'}`;
        pushTitle = 'Business Rejected';
        pushBody = `Your business "${business.name}" has been rejected. Reason: ${updateData.rejectionReason || 'No reason provided'}`;
      }

      // Create notification
      const ownerNotification = new NotificationModel({
        title: notificationTitle,
        message: notificationMessage,
        type: updateData.approvalStatus === 'approved' ? 'business_approval' : 'business_rejection',
        recipient: business.owner,
        sender: adminId,
        business: businessId,
        data: {
          businessId: businessId,
          businessName: business.name,
          approvedBy: adminId,
          rejectionReason: updateData.rejectionReason
        }
      });
      await ownerNotification.save();

      // Send push notification
      if (owner && owner.subscription && owner.subscription.endpoint) {
        const payload = {
          title: pushTitle,
          body: pushBody,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: {
            businessId: businessId,
            type: updateData.approvalStatus === 'approved' ? 'business_approved' : 'business_rejected'
          }
        };
        
        await sendPushNotification(owner.subscription, payload);
      }
    }

    res.status(200).json(successResponse(200, "Business updated successfully by admin", updatedBusiness));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to update business", error.message));
  }
};

// Get all leads for a specific business
module.exports.getAllLeads = async (req, res) => {
  try {
    const businessId = req.params.id;
    const { leadId, messagesOnly } = req.query;
    
    const business = await BussinessModel.findById(businessId)
      .select('name lead activeLeads')
      .populate('lead._id', 'name email phone_number isActive createdAt');

    if (!business) {
      return res.status(404).json(errorResponse(404, "Business not found"));
    }

    let leads = business.lead;
    
    // Filter by specific lead if leadId is provided
    if (leadId) {
      leads = leads.filter(lead => lead._id.toString() === leadId);
      if (leads.length === 0) {
        return res.status(404).json(errorResponse(404, "Lead not found"));
      }
    }

    // Filter leads that have messages if messagesOnly is true
    if (messagesOnly === 'true') {
      leads = leads.filter(lead => lead.message && lead.message.trim() !== '');
    }

    res.status(200).json(successResponse(200, "Leads retrieved successfully", {
      businessName: business.name,
      totalLeads: business.lead.length,
      activeLeads: business.activeLeads,
      leadsWithMessages: business.lead.filter(lead => lead.message && lead.message.trim() !== '').length,
      leads: leads
    }));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to retrieve leads", error.message));
  }
};

// Get all leads across all businesses (admin only)
module.exports.getAllLeadsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 50, businessId, search } = req.query;
    
    // Build filter for businesses
    const businessFilter = {};
    if (businessId) {
      businessFilter._id = businessId;
    }
    
    // Build search filter for leads
    let leadFilter = {};
    if (search) {
      leadFilter.$or = [
        { 'lead.name': { $regex: search, $options: 'i' } },
        { 'lead.email': { $regex: search, $options: 'i' } },
        { 'lead.phone': { $regex: search, $options: 'i' } },
        { 'lead.message': { $regex: search, $options: 'i' } }
      ];
    }

    const businesses = await BussinessModel.find(businessFilter)
      .select('name lead activeLeads owner')
      .populate('owner', 'name email')
      .populate('lead._id', 'name email phone_number isActive createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // If search filter is applied, filter the leads
    let filteredBusinesses = businesses;
    if (search) {
      filteredBusinesses = businesses.map(business => ({
        ...business.toObject(),
        lead: business.lead.filter(lead => 
          lead.name.toLowerCase().includes(search.toLowerCase()) ||
          lead.email.toLowerCase().includes(search.toLowerCase()) ||
          lead.phone.includes(search) ||
          (lead.message && lead.message.toLowerCase().includes(search.toLowerCase()))
        )
      })).filter(business => business.lead.length > 0);
    }

    const total = await BussinessModel.countDocuments(businessFilter);

    res.status(200).json(successResponse(200, "All leads retrieved successfully", {
      businesses: filteredBusinesses,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        limit: parseInt(limit)
      }
    }));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to retrieve all leads", error.message));
  }
};

// Update lead message
module.exports.updateLeadMessage = async (req, res) => {
  try {
    const businessId = req.params.businessId;
    const leadId = req.params.leadId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json(errorResponse(400, "Message is required"));
    }

    const business = await BussinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json(errorResponse(404, "Business not found"));
    }

    // Find the lead in the business
    const leadIndex = business.lead.findIndex(lead => lead._id.toString() === leadId);
    if (leadIndex === -1) {
      return res.status(404).json(errorResponse(404, "Lead not found in this business"));
    }

    // Update the message
    business.lead[leadIndex].message = message;
    await business.save();

    res.status(200).json(successResponse(200, "Lead message updated successfully", {
      lead: business.lead[leadIndex]
    }));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to update lead message", error.message));
  }
};

// Upload business image
module.exports.uploadBusinessImage = async (req, res) => {
  try {
    const businessId = req.params.id;
    const userId = req.userId;
    const userRole = req.userRole;

    if (!req.file) {
      return res.status(400).json(errorResponse(400, "No image file provided"));
    }

    // Get the business
    const business = await BussinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json(errorResponse(404, "Business not found"));
    }

    // Check permissions
    const isOwner = business.owner.toString() === userId;
    const isAdmin = userRole === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json(errorResponse(403, 'Access denied. You can only update your own business or need admin privileges.'));
    }

    // Delete old image if exists
    if (business.images) {
      deleteOldImage(business.images);
    }

    // Update business with new image
    business.images = getRelativePath(req.file.path);
    await business.save();

    res.status(200).json(successResponse(200, "Business image uploaded successfully", {
      businessId: business._id,
      imagePath: business.images
    }));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to upload business image", error.message));
  }
};

// Debug endpoint to test form data parsing
module.exports.debugFormData = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Debug information",
      data: {
        body: req.body,
        files: req.file,
        contentType: req.get('Content-Type'),
        headers: req.headers
      }
    });
  } catch (error) {
    res.status(500).json(errorResponse(500, "Debug failed", error.message));
  }
};


