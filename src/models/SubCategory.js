const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  title:{type: String},
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: String,
  image: String,
 contact :{ 
  phone:Number,
  email:String,
  website:String,
 },
 facility:String,
 membership_plans:String,
 personal_info:{
  type:String,
  medium:String,
  board:String,
  classes:String,
 },
  count:Number,
  timing:String,
  calling:Number,
  services:String,
  emergency:Number,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

SubcategoryModel = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubcategoryModel ;