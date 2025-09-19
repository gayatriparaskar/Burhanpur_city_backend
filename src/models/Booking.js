const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  booking_id: { type: String, unique: true, required: true }, // Auto generated
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Kisne booking ki
  business_id: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true }, // Business ID
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true }, // Product ID
  type: { 
    type: String, 
    enum: ["Management & Service", "Product-based service"], 
    required: true 
  }, // Kis type ki booking hai

  // Common Fields
  booking_date: { type: Date, default: Date.now },   // Kab booking ki gayi
  scheduled_date: { type: Date },                    // Kab ke liye booking hai
  start_time: Date,
  end_time: Date,
  location: String,

  // Payment Info
  amount: { type: Number },
  payment_status: { 
    type: String, 
    enum: ["pending", "paid", "failed", "refunded"], 
    default: "pending" 
  },
  payment_method: String, // UPI, Card, Cash, Wallet, etc.
  transaction_id: String,

  // Booking Status
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "cancelled", "completed"], 
    default: "pending" 
  },

  // Optional / Dynamic Details (different booking types ke liye)
  guest_count: Number,   // hotel / event
  seat_number: String,   // travel
  doctor_id: String,     // appointment
  vehicle_type: String,  // cab
  extra_details: { type: Object }, // flexible JSON for any extra info

}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
