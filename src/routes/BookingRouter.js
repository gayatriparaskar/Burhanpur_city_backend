const express = require("express");
const bookingRouter = express.Router();
const {createBooking, getBookingById, getBookingsByUser, updateBooking, deleteBooking} = require("../controllers/BookingController");
// Create booking
bookingRouter.post("/", createBooking);

// Get booking by ID
bookingRouter.get("/get/:id", getBookingById);

// Get all bookings for a user
bookingRouter.get("/user/:id", getBookingsByUser);

// Update booking
bookingRouter.put("/:id", updateBooking);

// Delete booking
bookingRouter.delete("/:id", deleteBooking);

module.exports = bookingRouter;
