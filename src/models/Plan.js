const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number },
  type: { type: String, enum: ['Basic', 'Standard', 'Premium'], default: 'Basic' },
  validity: { type: String, required: true }, // e.g., '1 Month', '3 Months'
  features: { type: [String], required: true },
}, {
  timestamps: true,
});
const PlanModel = mongoose.model('Plan', PlanSchema);
module.exports = PlanModel;