const NotificationModel = require("../models/Notification");
const BusinessModel = require("../models/Business");
const ProductModel = require("../models/Product");
const BookingModel = require("../models/Booking");
const { errorResponse, successResponse } = require("../helper/successAndError");

// Get notifications for a user
module.exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, unreadOnly = false } = req.query;

    const filter = { recipient: userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await NotificationModel.find(filter)
      .populate('sender', 'name email phone')
      .populate('business', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await NotificationModel.countDocuments(filter);

    res.status(200).json(successResponse(200, "Notifications fetched", {
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to fetch notifications", error.message));
  }
};

// Mark notification as read
module.exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.userId;

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json(errorResponse(404, "Notification not found"));
    }

    res.status(200).json(successResponse(200, "Notification marked as read", notification));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to mark notification as read", error.message));
  }
};

// Mark all notifications as read
module.exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await NotificationModel.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json(successResponse(200, "All notifications marked as read"));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to mark all notifications as read", error.message));
  }
};

// Get unread notification count
module.exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const unreadCount = await NotificationModel.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.status(200).json(successResponse(200, "Unread count fetched", { unreadCount }));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to get unread count", error.message));
  }
};

// Delete notification
module.exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.userId;

    const notification = await NotificationModel.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json(errorResponse(404, "Notification not found"));
    }

    res.status(200).json(successResponse(200, "Notification deleted successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to delete notification", error.message));
  }
};

// Get all user notifications (unified API for business, product, booking notifications)
module.exports.getAllUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      page = 1, 
      limit = 20, 
      type, 
      unreadOnly = false,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter for notifications
    const notificationFilter = { recipient: userId };
    if (unreadOnly === 'true') {
      notificationFilter.isRead = false;
    }
    if (type) {
      notificationFilter.type = type;
    }
    if (dateFrom || dateTo) {
      notificationFilter.createdAt = {};
      if (dateFrom) notificationFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) notificationFilter.createdAt.$lte = new Date(dateTo);
    }

    // Get notifications with pagination
    const notifications = await NotificationModel.find(notificationFilter)
      .populate('sender', 'name email phone')
      .populate('business', 'name description images')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get user's businesses for business-related notifications
    const userBusinesses = await BusinessModel.find({ owner: userId })
      .select('_id name description images approvalStatus isActive status')
      .populate('category', 'name')
      .populate('subCategory', 'name');

    // Get user's products for product-related notifications
    const userProducts = await ProductModel.find({ 
      bussinessId: { $in: userBusinesses.map(b => b._id) }
    })
      .select('_id name description image approvalStatus isActive status bussinessId')
      .populate('bussinessId', 'name');

    // Get user's bookings for booking-related notifications
    const userBookings = await BookingModel.find({ user_id: userId })
      .select('_id booking_id type status payment_status amount scheduled_date business_id product_id')
      .populate('business_id', 'name images')
      .populate('product_id', 'name image')
      .sort({ createdAt: -1 });

    // Get statistics
    const totalNotifications = await NotificationModel.countDocuments(notificationFilter);
    const unreadCount = await NotificationModel.countDocuments({
      recipient: userId,
      isRead: false
    });

    // Categorize notifications by type
    const categorizedNotifications = {
      business: notifications.filter(n => n.type.includes('business')),
      product: notifications.filter(n => n.type.includes('product')),
      booking: notifications.filter(n => n.type.includes('booking') || n.type === 'general'),
      system: notifications.filter(n => !n.type.includes('business') && !n.type.includes('product') && !n.type.includes('booking'))
    };

    // Get recent activity summary
    const recentActivity = {
      businesses: userBusinesses.slice(0, 5),
      products: userProducts.slice(0, 5),
      bookings: userBookings.slice(0, 5)
    };

    res.status(200).json(successResponse(200, "All user notifications fetched successfully", {
      notifications: {
        all: notifications,
        categorized: categorizedNotifications,
        total: totalNotifications,
        unreadCount
      },
      userData: {
        businesses: userBusinesses,
        products: userProducts,
        bookings: userBookings,
        recentActivity
      },
      pagination: {
        totalPages: Math.ceil(totalNotifications / limit),
        currentPage: parseInt(page),
        total: totalNotifications,
        limit: parseInt(limit)
      },
      filters: {
        type: type || null,
        unreadOnly: unreadOnly === 'true',
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        sortBy,
        sortOrder
      }
    }));
  } catch (error) {
    console.error('Get all user notifications error:', error);
    res.status(500).json(errorResponse(500, "Failed to fetch all user notifications", error.message));
  }
};

// Get notification summary/dashboard
module.exports.getNotificationSummary = async (req, res) => {
  try {
    const userId = req.userId;

    // Get notification counts by type
    const notificationCounts = await NotificationModel.aggregate([
      { $match: { recipient: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          unread: { $sum: { $cond: ['$isRead', 0, 1] } }
        }
      }
    ]);

    // Get recent notifications (last 5)
    const recentNotifications = await NotificationModel.find({ recipient: userId })
      .populate('sender', 'name email')
      .populate('business', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get user's business/product/booking counts
    const userBusinesses = await BusinessModel.countDocuments({ owner: userId });
    const userProducts = await ProductModel.countDocuments({ 
      bussinessId: { $in: await BusinessModel.find({ owner: userId }).distinct('_id') }
    });
    const userBookings = await BookingModel.countDocuments({ user_id: userId });

    // Get pending approvals
    const pendingBusinesses = await BusinessModel.countDocuments({ 
      owner: userId, 
      approvalStatus: 'pending' 
    });
    const pendingProducts = await ProductModel.countDocuments({ 
      bussinessId: { $in: await BusinessModel.find({ owner: userId }).distinct('_id') },
      approvalStatus: 'pending'
    });

    res.status(200).json(successResponse(200, "Notification summary fetched successfully", {
      notificationCounts,
      recentNotifications,
      userStats: {
        businesses: userBusinesses,
        products: userProducts,
        bookings: userBookings,
        pendingBusinesses,
        pendingProducts
      }
    }));
  } catch (error) {
    console.error('Get notification summary error:', error);
    res.status(500).json(errorResponse(500, "Failed to fetch notification summary", error.message));
  }
};

// Get notifications by entity type (business, product, booking)
module.exports.getNotificationsByEntity = async (req, res) => {
  try {
    const userId = req.userId;
    const { entityType, entityId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    let filter = { recipient: userId };

    // Filter by entity type
    switch (entityType) {
      case 'business':
        filter.business = entityId;
        break;
      case 'product':
        filter.data = { $exists: true };
        // Additional filtering for product-related notifications
        break;
      case 'booking':
        filter.type = { $in: ['booking_confirmed', 'booking_cancelled', 'booking_reminder'] };
        break;
      default:
        return res.status(400).json(errorResponse(400, "Invalid entity type"));
    }

    const notifications = await NotificationModel.find(filter)
      .populate('sender', 'name email')
      .populate('business', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await NotificationModel.countDocuments(filter);

    res.status(200).json(successResponse(200, `${entityType} notifications fetched successfully`, {
      notifications,
      entityType,
      entityId,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        limit: parseInt(limit)
      }
    }));
  } catch (error) {
    console.error('Get notifications by entity error:', error);
    res.status(500).json(errorResponse(500, "Failed to fetch entity notifications", error.message));
  }
};
