const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business'},
  title: { type: String, required: true },
  description: String,
  image: String,
  url: String,
  position: { type: String, enum: ['home_banner', 'sidebar', 'footer'] },
  addType:{type:String,enum:["popUp","product","slider"]},
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Advertisement', advertisementSchema);