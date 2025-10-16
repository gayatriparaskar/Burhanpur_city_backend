const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  // User who submitted the enquiry
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Enquiry description
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Target category/subcategory for detecting businesses
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: true
  }
  
}, { 
  timestamps: true 
});

// Indexes for better performance
enquirySchema.index({ category: 1, subCategory: 1 });
enquirySchema.index({ user: 1 });
enquirySchema.index({ createdAt: -1 });

const EnquiryModel = mongoose.model('Enquiry', enquirySchema);
module.exports = EnquiryModel;
