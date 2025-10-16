const express = require("express");
const authentication = require("../middleware/authentication");
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  getAllUserNotifications,
  getNotificationSummary,
  getNotificationsByEntity
} = require("../controllers/NotificationController");

const NotificationRouter = express.Router();

// Get user notifications
NotificationRouter.get("/", authentication, getUserNotifications);

// Mark notification as read
NotificationRouter.put("/:id/read", authentication, markAsRead);

// Mark all notifications as read
NotificationRouter.put("/mark-all-read", authentication, markAllAsRead);

// Get unread notification count
NotificationRouter.get("/unread-count", authentication, getUnreadCount);

// Delete notification
NotificationRouter.delete("/:id", authentication, deleteNotification);

// Get all user notifications (unified API for business, product, booking)
NotificationRouter.get("/all", authentication, getAllUserNotifications);

// Get notification summary/dashboard
NotificationRouter.get("/summary", authentication, getNotificationSummary);

// Get notifications by entity type (business, product, booking)
NotificationRouter.get("/entity/:entityType/:entityId", authentication, getNotificationsByEntity);

module.exports = NotificationRouter;
