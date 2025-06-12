const mongoose = require("mongoose");

const upiOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  plan: { type: mongoose.Types.ObjectId, ref: "Plan", required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  gateway: { type: String, required: true },
  planName: { type: String, required: true },
  status: { type: String, enum: ["pending", "success"], default: "pending" },
  createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model("upiorder", upiOrderSchema);
