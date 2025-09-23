const Booking = require("../models/Booking");
const Business = require("../models/Business");
const Product = require("../models/Product");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

// ✅ Create new booking
exports.createBooking = async (req, res) => {
  try {
    const { business_id, product_id, user_id, type, ...otherData } = req.body;
    
    // Validate required fields
    if (!business_id || !product_id || !user_id || !type) {
      return res.status(400).json({ 
        success: false, 
        message: "business_id, product_id, user_id, and type are required" 
      });
    }

    // Check if user exists and is not blocked
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ 
        success: false, 
        message: "Blocked users cannot create bookings. Please contact support." 
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ 
        success: false, 
        message: "Inactive users cannot create bookings. Please contact support to reactivate your account." 
      });
    }

    // Check if business exists and is not blocked
    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({ 
        success: false, 
        message: "Business not found" 
      });
    }

    if (business.status === 'blocked') {
      return res.status(403).json({ 
        success: false, 
        message: "This business is currently blocked and not accepting bookings." 
      });
    }

    if (business.status === 'inactive') {
      return res.status(403).json({ 
        success: false, 
        message: "This business is currently inactive and not accepting bookings." 
      });
    }

    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    const bookingData = {
      ...otherData,
      business_id,
      product_id,
      user_id,
      type
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Populate the booking with business and product details
    await booking.populate([
      { path: 'business_id', select: 'businessName email phone address' },
      { path: 'product_id', select: 'name price description' },
      { path: 'user_id', select: 'name email phone' }
    ]);

    res.status(201).json({ success: true, message: "Booking created", data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating booking", error: err.message });
  }
};

// ✅ Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate([
        { path: 'business_id', select: 'businessName email phone address' },
        { path: 'product_id', select: 'name price description' },
        { path: 'user_id', select: 'name email phone' }
      ]);
    
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get bookings by User
exports.getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.params.userId })
      .populate([
        { path: 'business_id', select: 'businessName email phone address' },
        { path: 'product_id', select: 'name price description' },
        { path: 'user_id', select: 'name email phone' }
      ])
      .sort({ createdAt: -1 });
    
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update booking (status, payment, etc.)
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate([
        { path: 'business_id', select: 'businessName email phone address' },
        { path: 'product_id', select: 'name price description' },
        { path: 'user_id', select: 'name email phone' }
      ]);
    
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

// ✅ Get bookings by Business
exports.getBookingsByBusiness = async (req, res) => {
  try {
    const bookings = await Booking.find({ business_id: req.params.businessId })
      .populate([
        { path: 'business_id', select: 'businessName email phone address' },
        { path: 'product_id', select: 'name price description' },
        { path: 'user_id', select: 'name email phone' }
      ])
      .sort({ createdAt: -1 });
    
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get bookings by Product
exports.getBookingsByProduct = async (req, res) => {
  try {
    const bookings = await Booking.find({ product_id: req.params.productId })
      .populate([
        { path: 'business_id', select: 'businessName email phone address' },
        { path: 'product_id', select: 'name price description' },
        { path: 'user_id', select: 'name email phone' }
      ])
      .sort({ createdAt: -1 });
    
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get all bookings with filters
exports.getAllBookings = async (req, res) => {
  try {
    const { status, payment_status, type, business_id, product_id } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (payment_status) filter.payment_status = payment_status;
    if (type) filter.type = type;
    if (business_id) filter.business_id = business_id;
    if (product_id) filter.product_id = product_id;

    const bookings = await Booking.find(filter)
      .populate([
        { path: 'business_id', select: 'businessName email phone address' },
        { path: 'product_id', select: 'name price description' },
        { path: 'user_id', select: 'name email phone' }
      ])
      .sort({ createdAt: -1 });
    
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
