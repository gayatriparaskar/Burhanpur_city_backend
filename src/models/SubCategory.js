const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: String,
  image: String,
  speciality:String,
  rating:Number,
  address:String,
  timing:String,
  calling:Number,
  details:String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

SubcategoryModel = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubcategoryModel ;