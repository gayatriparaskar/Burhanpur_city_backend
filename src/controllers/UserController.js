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

module.exports.adminLogin = async (req,res)=>{
    try {
        const { phone , password } =req.body;
        // const secretKey = "12345678";
        const existPhone = await UserModel.findOne({phone});
        if(!existPhone)
        {
          return  res.status(500).json(errorResponse(500,"Phone no. is not found"));
        }
        // console.log("Email not found")
        const compare = await bcrypt.compare(password,existPhone.password);
        if(!compare){
          return  res.status(500).json(errorResponse(500,"Invalid Credentials"));
        }
        // console.log(ACCESS_TOKEN_SECRET);
        
        const token = jwt.sign({userId: existPhone._id},JWT_SECRET);
        console.log(existPhone.role);
        
       return res.status(200).json(successResponse(200,"Token is generated successfully",token));

    } catch (error) {
        res.status(500).json(errorResponse(500,"User Login failed",error));
    }
};

module.exports.getOneUser = async (req,res)=>{
    try {
        const id = req.userId;
        const getUser = await UserModel.findById(id).select('name address role email phone');
        if (!getUser) {
      return res.status(404).json(errorResponse(404, "User not found"));
    }
        console.log(id,"one");
        console.log(getUser,"2");
        res.status(200).json(successResponse(200,"Get One User Detail",getUser));
    } catch (error) {
        res.status(500).json(errorResponse(500,"Ivalid Credential",error));
    }
}
