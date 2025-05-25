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

module.exports.createUser = async (req,res)=>{
   try {
    const data = req.body;
     const bcryptPassword = await bcrypt.hash(data.password,SALT_ROUNDS);
     delete data.password;
     const newUser = await UserModel({...req.body,password:bcryptPassword});
     newUser.save();
     console.log(newUser);
    //  .json(errorResponse(400, "User is already registered"));
     res.status(200).json(successResponse(200,"User is Created Successfully",newUser));
   } catch (error) {
    console.log(error);
    res.status(500).json(errorResponse(500,"User is not Created"));
   }
};

module.exports.getAllUser = async (req,res)=>{
    try {
        const data = req.body;
        const userDetails = await UserModel.find();
        res.status(200).json(successResponse(200,"User Details is fetched",userDetails));
    } catch (error) {
        res.status(500).json(errorResponse(500,"Details is not found"));
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
        res.status(500).json(errorResponse(500,"User is not Updated"));
    }
};

module.exports.deleteUser = async (req,res)=>{
    try {
        const id = req.params.id;
        const deletedUser = await UserModel.findByIdAndDelete(id);
        res.status(200).json(successResponse(200,"User is deleted successfully",deletedUser));
    } catch (error) {
        res.status(500).json(errorResponse(500,"User is not deleted"));
    }
};

module.exports.adminLogin = async (req,res)=>{
    try {
        const { phone , password } =req.body;
        // const secretKey = "12345678";
        const existPhone = await UserModel.findOne({phone});
        if(!existPhone)
        {
            res.status(404).json(errorResponse(404,"Phone no. is not found"));
        }
        // console.log("Email not found")
        const compare = await bcrypt.compare(password,existPhone.password);
        if(!compare){
            res.status(404).json(errorResponse(404,"Invalid Credentials"));
        }
        // console.log(ACCESS_TOKEN_SECRET);
        
        const token = jwt.sign({userId: existPhone._id},JWT_SECRET);
        console.log(existPhone.role);
        
        res.status(200).json(successResponse(200,"Token is generated successfully",token));

    } catch (error) {
        res.status(404).json(errorResponse(404,"User Login failed"));
    }
};

module.exports.getOneUser = async (req,res)=>{
    try {
        const id = req.userId;
        const getUser = await UserModel.findById(id);
        console.log(id,"one");
        res.status(200).json(successResponse(200,"Get One User Detail",getUser));
    } catch (error) {
        res.status(500).json(errorResponse(500,"Ivalid Credential"));
    }
}
