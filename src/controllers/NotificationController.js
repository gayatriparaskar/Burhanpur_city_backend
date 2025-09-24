const NotificationModel = require("../models/Notification");
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
