const Booking = require("../models/Booking");
const { v4: uuidv4 } = require("uuid");

// ✅ Create new booking
exports.createBooking = async (req, res) => {
  try {
    const bookingData = req.body;
    bookingData.booking_id = "BK_" + uuidv4(); // unique ID

    const booking = new Booking(bookingData);
    await booking.save();

    res.status(201).json({ success: true, message: "Booking created", data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating booking", error: err.message });
  }
};

// ✅ Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get bookings by User
exports.getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.params.userId });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update booking (status, payment, etc.)
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, message: "Booking updated", data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete / Cancel booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
