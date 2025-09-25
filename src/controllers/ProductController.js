const ProductModel = require("../models/Product");  // adjust path as per your structure
const { successResponse, errorResponse } = require("../helper/successAndError");
const UserModel = require("../models/User");
const NotificationModel = require("../models/Notification");
const { sendPushNotification } = require("../utils/sendPushNotification");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const data = req.body;
    
    // Set approval status to pending for new products
    data.approvalStatus = 'pending';
    data.isActive = false; // Product is inactive until approved
    data.status = 'inactive';

    const product = new ProductModel(data);
    const savedProduct = await product.save();

    // Find all admin users to send notification
    const adminUsers = await UserModel.find({ role: 'admin' });
    
    // Create notifications for all admins
    const notifications = adminUsers.map(admin => ({
      title: 'New Product Approval Required',
      message: `A new product "${data.name}" has been submitted and requires approval.`,
      type: 'business_approval', // Reusing business approval type for products
      recipient: admin._id,
      business: data.bussinessId, // Link to business
      data: {
        productId: savedProduct._id,
        productName: data.name,
        businessId: data.bussinessId
      }
    }));

    await NotificationModel.insertMany(notifications);

    // Send push notifications to admins
    for (const admin of adminUsers) {
      if (admin.subscription && admin.subscription.endpoint) {
        const payload = {
          title: 'New Product Approval Required',
          body: `A new product "${data.name}" has been submitted and requires approval.`,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: {
            productId: savedProduct._id,
            type: 'product_approval'
          }
        };
        
        await sendPushNotification(admin.subscription, payload);
      }
    }

    res.status(201).json(successResponse(201, "Product submitted for approval", savedProduct));
  } catch (error) {
    res.status(400).json(errorResponse(400, "Failed to create product", error.message));
  }
};

// Get all products (only approved)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({ 
      approvalStatus: 'approved',
      isActive: true,
      status: 'active'
    })
    .populate('bussinessId', 'name owner')
    .populate('approvedBy', 'name email');
    
    res.status(200).json(successResponse(200, "Products retrieved successfully", products));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to retrieve products", error.message));
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json(errorResponse(404, "Product not found"));
    }
    res.status(200).json(successResponse(200, "Product retrieved successfully", product));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to retrieve product", error.message));
  }
};

// Unified product update function for both owner and admin
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    const userId = req.userId; // From authentication middleware
    const userRole = req.userRole; // From authentication middleware
    
    // Get the product first to check ownership through business
    const product = await ProductModel.findById(productId).populate('bussinessId', 'owner');
    if (!product) {
      return res.status(404).json(errorResponse(404, 'Product not found'));
    }
    
    // Check permissions - owner through business or admin
    const isOwner = product.bussinessId && product.bussinessId.owner.toString() === userId;
    const isAdmin = userRole === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json(errorResponse(403, 'Access denied. You can only update products from your business or need admin privileges.'));
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
    if (isAdmin && updateData.approvalStatus && updateData.approvalStatus !== product.approvalStatus) {
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
    
    // Update the product
    const updatedProduct = await ProductModel.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    }).populate('bussinessId', 'name owner')
     .populate('approvedBy', 'name email');
    
    // Send notification to business owner if admin changed approval status
    if (isAdmin && updateData.approvalStatus && updateData.approvalStatus !== product.approvalStatus) {
      const business = await ProductModel.findById(productId).populate('bussinessId');
      if (business && business.bussinessId) {
        const owner = await UserModel.findById(business.bussinessId.owner);
        
        let notificationTitle, notificationMessage, pushTitle, pushBody;
        
        if (updateData.approvalStatus === 'approved') {
          notificationTitle = 'Product Approved';
          notificationMessage = `Your product "${product.name}" has been approved and is now active.`;
          pushTitle = 'Product Approved';
          pushBody = `Your product "${product.name}" has been approved and is now active.`;
        } else if (updateData.approvalStatus === 'rejected') {
          notificationTitle = 'Product Rejected';
          notificationMessage = `Your product "${product.name}" has been rejected. Reason: ${updateData.rejectionReason || 'No reason provided'}`;
          pushTitle = 'Product Rejected';
          pushBody = `Your product "${product.name}" has been rejected. Reason: ${updateData.rejectionReason || 'No reason provided'}`;
        }

        // Create notification
        const ownerNotification = new NotificationModel({
          title: notificationTitle,
          message: notificationMessage,
          type: updateData.approvalStatus === 'approved' ? 'product_approval' : 'product_rejection',
          recipient: business.bussinessId.owner,
          sender: userId,
          business: business.bussinessId._id,
          data: {
            productId: productId,
            productName: product.name,
            businessId: business.bussinessId._id,
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
              productId: productId,
              type: updateData.approvalStatus === 'approved' ? 'product_approved' : 'product_rejected'
            }
          };
          
          await sendPushNotification(owner.subscription, payload);
        }
      }
    }
    
    const message = isAdmin ? "Product updated successfully by admin" : "Product updated successfully";
    res.status(200).json(successResponse(200, message, updatedProduct));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to update product", error.message));
  }
};

// Delete product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json(errorResponse(404, "Product not found"));
    }
    res.status(200).json(successResponse(200, "Product deleted successfully", deletedProduct));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to delete product", error.message));
  }
};

// Admin function to approve product
exports.approveProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const adminId = req.userId; // From authentication middleware

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json(errorResponse(404, "Product not found"));
    }

    if (product.approvalStatus !== 'pending') {
      return res.status(400).json(errorResponse(400, "Product is not pending approval"));
    }

    // Update product status
    product.approvalStatus = 'approved';
    product.approvedBy = adminId;
    product.approvedAt = new Date();
    product.isActive = true;
    product.status = 'active';
    await product.save();

    // Get business owner to send notification
    const business = await ProductModel.findById(productId).populate('bussinessId');
    if (business && business.bussinessId) {
      // Create notification for business owner
      const ownerNotification = new NotificationModel({
        title: 'Product Approved',
        message: `Your product "${product.name}" has been approved and is now active.`,
        type: 'business_approval',
        recipient: business.bussinessId.owner,
        business: business.bussinessId._id,
        data: {
          productId: productId,
          productName: product.name,
          approvedBy: adminId
        }
      });
      await ownerNotification.save();

      // Send push notification to business owner
      const owner = await UserModel.findById(business.bussinessId.owner);
      if (owner && owner.subscription && owner.subscription.endpoint) {
        const payload = {
          title: 'Product Approved',
          body: `Your product "${product.name}" has been approved and is now active.`,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: {
            productId: productId,
            type: 'product_approved'
          }
        };
        
        await sendPushNotification(owner.subscription, payload);
      }
    }

    res.status(200).json(successResponse(200, "Product approved successfully", product));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to approve product", error.message));
  }
};

// Admin function to reject product
exports.rejectProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const adminId = req.userId; // From authentication middleware
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json(errorResponse(400, "Rejection reason is required"));
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json(errorResponse(404, "Product not found"));
    }

    if (product.approvalStatus !== 'pending') {
      return res.status(400).json(errorResponse(400, "Product is not pending approval"));
    }

    // Update product status
    product.approvalStatus = 'rejected';
    product.approvedBy = adminId;
    product.approvedAt = new Date();
    product.rejectionReason = rejectionReason;
    product.isActive = false;
    product.status = 'inactive';
    await product.save();

    // Get business owner to send notification
    const business = await ProductModel.findById(productId).populate('bussinessId');
    if (business && business.bussinessId) {
      // Create notification for business owner
      const ownerNotification = new NotificationModel({
        title: 'Product Rejected',
        message: `Your product "${product.name}" has been rejected. Reason: ${rejectionReason}`,
        type: 'business_rejection',
        recipient: business.bussinessId.owner,
        business: business.bussinessId._id,
        data: {
          productId: productId,
          productName: product.name,
          rejectionReason: rejectionReason,
          rejectedBy: adminId
        }
      });
      await ownerNotification.save();

      // Send push notification to business owner
      const owner = await UserModel.findById(business.bussinessId.owner);
      if (owner && owner.subscription && owner.subscription.endpoint) {
        const payload = {
          title: 'Product Rejected',
          body: `Your product "${product.name}" has been rejected. Reason: ${rejectionReason}`,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: {
            productId: productId,
            type: 'product_rejected'
          }
        };
        
        await sendPushNotification(owner.subscription, payload);
      }
    }

    res.status(200).json(successResponse(200, "Product rejected successfully", product));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to reject product", error.message));
  }
};

// Get pending products for admin
exports.getPendingProducts = async (req, res) => {
  try {
    const pendingProducts = await ProductModel.find({ approvalStatus: 'pending' })
      .populate('bussinessId', 'name owner')
      .populate('approvedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json(successResponse(200, "Pending products fetched", pendingProducts));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to fetch pending products", error.message));
  }
};

// Get all products for admin (regardless of approval status)
exports.getAllProductsForAdmin = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      approvalStatus, 
      status, 
      isActive, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { speciality: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await ProductModel.find(filter)
      .populate('bussinessId', 'name owner')
      .populate('approvedBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProductModel.countDocuments(filter);

    // Get statistics
    const stats = await ProductModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'rejected'] }, 1, 0] }
          },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactive: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json(successResponse(200, "All products fetched successfully", {
      products,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        limit: parseInt(limit)
      },
      stats: stats[0] || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        active: 0,
        inactive: 0
      }
    }));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to fetch all products", error.message));
  }
};