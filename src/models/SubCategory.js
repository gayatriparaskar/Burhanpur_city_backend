const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory:{ type: mongoose.Schema.Types.ObjectId, ref:"subCategory", required:false},
  description: String,
  image: String,
  
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

subCategorySchema.index({ name: 1, category: 1 }, { unique: true });

const SubcategoryModel = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubcategoryModel;
