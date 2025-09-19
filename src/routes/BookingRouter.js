const express = require("express");
const bookingRouter = express.Router();
const {
  createBooking, 
  getBookingById, 
  getBookingsByUser, 
  updateBooking, 
  deleteBooking,
  getBookingsByBusiness,
  getBookingsByProduct,
  getAllBookings
} = require("../controllers/BookingController");

// Create booking
bookingRouter.post("/", createBooking);

// Get all bookings with filters
bookingRouter.get("/", getAllBookings);

// Get booking by ID
bookingRouter.get("/get/:id", getBookingById);

// Get all bookings for a user
bookingRouter.get("/user/:userId", getBookingsByUser);

// Get all bookings for a business
bookingRouter.get("/business/:businessId", getBookingsByBusiness);

// Get all bookings for a product
bookingRouter.get("/product/:productId", getBookingsByProduct);

// Update booking
bookingRouter.put("/:id", updateBooking);

// Delete booking
bookingRouter.delete("/:id", deleteBooking);

module.exports = bookingRouter;
