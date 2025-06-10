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
         console.error("Get All Users Error:", error);  // ✅ Add this line
        res.status(200).json(successResponse(200,"User Details is fetched",userDetails));
    } catch (error) {
        res.status(500).json(errorResponse(500,"Details is not found",error));
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

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
    return res
      .status(200)
      .json(successResponse(200, "Login successful", { token }));
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
