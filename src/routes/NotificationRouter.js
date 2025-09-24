const express = require("express");
const authentication = require("../middleware/authentication");
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
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

module.exports = NotificationRouter;
