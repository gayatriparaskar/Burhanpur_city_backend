const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
const jwt = require ("jsonwebtoken");
const {
    errorResponse,
    successResponse,
  } = require("../helper/successAndError");

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;

const UserModel = require("../models/User");

module.exports.createUser = async (req, res) => {
  try {
    const data = req.body;

    // Validate phone number
    if (!/^\d{10}$/.test(data.phone)) {
      return res.status(404).json(errorResponse(404, "Invalid phone number. Must be 10 digits only."));
    }

    // Check if user already exists by phone or email
    const existingUser = await UserModel.findOne({
      $or: [{ phone: data.phone }, { email: data.email }],
    });

    if (existingUser) {
      return res.status(404).json(errorResponse(404, "User already registered", existingUser));
    }

    // Hash password
    const bcryptPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    delete data.password;

    // Create and save user
    const newUser = new UserModel({ ...data, password: bcryptPassword });
    await newUser.save();

    console.log(newUser);

    res.status(200).json(successResponse(200, "User is created successfully", newUser));
  } catch (error) {
    console.log(error);
    res.status(500).json(errorResponse(500, "User is not created",error));
  }
};


module.exports.getAllUser = async (req,res)=>{
    try {
        const data = req.body;
        const userDetails = await UserModel.find();
        console.log("data",data);
        
        res.status(200).json(successResponse(200,"User Details is fetched",userDetails));
    } catch (error) {
        res.status(500).json(errorResponse(500,"Details is not found",error.message));
    }
};

module.exports.updateUer = async (req,res)=>{
    try {
        const query = req.body;
        const id = req.params.id;
        const updatedUser = await UserModel.findByIdAndUpdate(id,query,{
            new:true,
            runValidators:true
        })
        res.status(200).json(successResponse(200,"User is updated successfully",updatedUser));
    } catch (error) {
        res.status(500).json(errorResponse(500,"User is not Updated",error));
    }
};

module.exports.deleteUser = async (req,res)=>{
    try {
        const id = req.params.id;
        const deletedUser = await UserModel.findByIdAndDelete(id);
        res.status(200).json(successResponse(200,"User is deleted successfully",deletedUser));
    } catch (error) {
        res.status(500).json(errorResponse(500,"User is not deleted",error));
    }
};

module.exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await UserModel.findOne({ phone });
    if (!user) {
      return res.status(401).json(errorResponse(401, "Invalid credentials"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(errorResponse(401, "Invalid credentials"));
    }

     // Remove password before sending response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
    return res
      .status(200)
      .json(successResponse(200, "Login successful", { token , user:userWithoutPassword}));
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json(errorResponse(500, "Server Error"));
  }
};


module.exports.getOneUser = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Request userId:", userId);

    if (!mongoose.isValidObjectId(userId)) {
      return res
        .status(400)
        .json(errorResponse(400, "Malformed user ID in token"));
    }

    const user = await UserModel.findById(userId)
      .select("name address role email phone id");
       console.log("Fetched user:", user); // 👈 ADD THIS
    if (!user) {
      return res
        .status(404)
        .json(errorResponse(404, "User not found not registered"));
    }

    return res
      .status(200)
      .json(successResponse(200, "Get One User Detail", user));
  } catch (err) {
    console.error("getOneUser error:", err);
    return res
      .status(500)
      .json(errorResponse(500, "Server Error"));
  }
};

module.exports.searchUsers = async (req, res) => {
  try {
    const { 
      query, 
      role, 
      isActive, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build search filter
    const filter = {};

    // Text search across name and phone number only
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) {
      filter.role = role;
    }

    // Filter by active status
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute search with pagination
    const users = await UserModel.find(filter)
      .select('-password') // Exclude password from results
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await UserModel.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    // Prepare response data
    const responseData = {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    };

    res.status(200).json(
      successResponse(200, "Users searched successfully", responseData)
    );
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json(
      errorResponse(500, "Failed to search users", error.message)
    );
  }
};

module.exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate role
    const validRoles = ['user', 'admin', 'owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json(
        errorResponse(400, "Invalid role. Must be one of: user, admin, owner")
      );
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users by role
    const users = await UserModel.find({ role })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalUsers = await UserModel.countDocuments({ role });
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    const responseData = {
      users,
      role,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    };

    res.status(200).json(
      successResponse(200, `Users with role '${role}' fetched successfully`, responseData)
    );
  } catch (error) {
    console.error("Get users by role error:", error);
    res.status(500).json(
      errorResponse(500, "Failed to fetch users by role", error.message)
    );
  }
};