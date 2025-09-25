const CategoryModel = require("../models/Category");
const SubcategoryModel = require("../models/SubCategory");
const BusinessModel = require("../models/Business");
const ProductModel = require("../models/Product");
const { errorResponse, successResponse } = require("../helper/successAndError");

module.exports.createCategory = async (req, res) => {
    try {
        const data = req.body;
        // data.user = req.user.id;

        const existOne = await CategoryModel.findOne({ name: data.name });
        if (existOne) {
            return res.status(404).json(errorResponse(404, "Category already exists Cannot generae this", existOne));
        }

        const newCategory = new CategoryModel(data); // <-- pass data here!
        await newCategory.save();

        res.status(200).json(successResponse(200, "Category created successfully", newCategory));
    } catch (error) {
        res.status(500).json(errorResponse(500, "Category is invalid", error));
    }
};

// In CategoryController.js
module.exports.getCategory = async (req, res) => {
    try {
        const categoryDetail = await CategoryModel.find();
        res.status(200).json({
            success: true,
            message: 'Category data is fetched successfully',
            data: categoryDetail
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Category not found',
            error: error.message
        });
    }
};


module.exports.updateCategory = async(req,res)=>{
    try {
        const data = req.body;
        const id = req.params.id;
        const updateCategory = await CategoryModel.findByIdAndUpdate(id,data,{
            new:true,
            runValidators:true
        });
        res.status(200).json(successResponse(200,"Category is updated successfully",updateCategory));
    } catch (error) {
        res.status(500).json(errorResponse(500,"Category is not updated",error));
    }
};

module.exports.deleteCategory = async(req,res)=>{
    try {
        const id = req.params.id;
        const deletedCategory = await CategoryModel.findByIdAndDelete(id);
        res.status(200).json(successResponse(200,"Category is deleted",deletedCategory));
    } catch (error) {
        res.status(500).json(errorResponse(500,"Category is not Deleted",error));
    }
};

module.exports.searchCategory = async (req,res)=>{
   const { name, isActive } = req.name;

  const filter = {};

  if (name) {
    filter.$or = [
      { name: { $regex: name, $options: 'i' } },
      { description: { $regex: discription, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  try {
    const categories = await CategoryModel.find(filter);

    // ✅ Yeh check karega agar empty hai
    if (categories.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No categories found matching the search criteria',
        data: []
      });
    }

    // ✅ Agar mil gaya to
    return res.status(200).json({
      success: true,
      message: 'Categories found',
      data: categories
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message || error
    });
  }
}


module.exports.searchAll = async (req, res) => {
  const { query, type } = req.query;

  if (!query) {
    return res.status(400).json({ success: false, message: "Search query is required." });
  }

  const regex = new RegExp(query, "i"); // case-insensitive regex
  const results = {};
  const searches = [];

  if (!type || type === "category") {
    searches.push(
      CategoryModel.find({
        $and: [
          {
            $or: [
              { name: regex },
              { description: regex },
              { type: regex }
            ]
          },
          { isActive: true }
        ]
      }).then(data => results.categories = data)
    );
  }

  if (!type || type === "subcategory") {
    searches.push(
      SubcategoryModel.find({
        $and: [
          {
            $or: [
              { name: regex },
              { title: regex },
              { description: regex }
            ]
          },
          { isActive: true }
        ]
      }).then(data => results.subcategories = data)
    );
  }

  if (!type || type === "business") {
    searches.push(
      BusinessModel.find({
        $and: [
          {
            $or: [
              { name: regex },
              { description: regex },
              { "address.city": regex },
              { "address.state": regex },
              { specility: regex },
              { block: regex },
              { features: regex },
              { keyWords: regex }
            ]
          },
          {
            approvalStatus: 'approved',
            isActive: true,
            status: 'active'
          }
        ]
      }).then(data => results.businesses = data)
    );
  }

  if (!type || type === "product") {
    searches.push(
      ProductModel.find({
        $and: [
          {
            $or: [
              { name: regex },
              { description: regex },
              { brand: regex },
              { feature: regex },
              { speciality: regex },
              { keyWord: regex },
              { review: regex }
            ]
          },
          {
            approvalStatus: 'approved',
            isActive: true,
            status: 'active'
          }
        ]
      }).then(data => results.products = data)
    );
  }

  try {
    await Promise.all(searches);
    res.status(200).json({
      success: true,
      message: "Search results fetched",
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error
    });
  }
};
