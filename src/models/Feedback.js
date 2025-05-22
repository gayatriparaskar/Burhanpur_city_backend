const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description:String;
  createdAt:Date.now


})
