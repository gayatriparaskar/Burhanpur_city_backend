const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{type:String,required:true},
    bussinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    description:{type:String},
    price:{type:Number},
    offerPrice:{type:Number},
    brand:{type:String},
    image:[String],
    inStock:{type:Boolean},
    quantity:{type:String},
    feature:[String],
    speciality:{type:String},
    keyWord:[String],
    rating:{type:Number},
    review:{type:String},
    createdAt:{type:Date,default:Date.now},
    // Product approval system
    approvalStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    submittedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: false }, // Product is inactive until approved
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'blocked'], 
        default: 'inactive' 
    }
})
 
const ProductModel =  mongoose.model("Products",productSchema);
module.exports =  ProductModel ;