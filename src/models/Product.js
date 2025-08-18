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
    feature:{type:String},
    speciality:{type:String},
    keyWord:[String],
    rating:{type:Number},
    review:{type:String},
    createdAt:{type:Date,default:Date.now}
})
 
const ProductModel =  mongoose.model("Products",productSchema);
module.exports =  ProductModel ;