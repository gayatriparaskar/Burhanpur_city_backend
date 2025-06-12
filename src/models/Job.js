const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  description: { type: String, required: true },
  requirements: [String],
  type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
  salary: {
    min: Number,
    max: Number,
      currency: { type: String, default: 'INR' }
    },
    location: String,
    contactEmail: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    expiryDate: Date
  });
  const JobModel = mongoose.model('Job', jobSchema);
  module.exports = JobModel;