const JobModel = require('../models/Job'); // adjust path if needed
const {successResponse, errorResponse} = require('../helper/successAndError');

// Create a new job
module.exports.createJob = async (req, res) => {
  try {
    const jobData = req.body;
    const newJob = new JobModel(jobData);
    await newJob.save();

    const populatedJob = await JobModel.findById(newJob._id).populate('company');

    res.status(201).json(successResponse(201, 'Job created successfully', newJob));
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json(errorResponse(500, 'Failed to create job', error.message));
  }
};


// Get a job by ID
module.exports.getJobById = async (req, res) => {
  try {
    const job = await JobModel.findById(req.params.id).populate('company');
    if (!job) 
      res.status(404).json(errorResponse(404, 'Job not found'));

    res.status(200).json(successResponse(200, 'Job fetched successfully', job));
  } catch (error) {
    console.error('Get Job By ID Error:', error);
    res.status(500).json(errorResponse(500, 'Failed to get job', error.message));
  }
};


// Get all jobs (optionally filtered by isActive or type)
module.exports.getAllJobs = async (req, res) => {
  try {
    const filters = {};
    if (req.query.isActive) filters.isActive = req.query.isActive === 'true';
    if (req.query.type) filters.type = req.query.type;

    const jobs = await JobModel.find(filters).populate('company');
    res.status(200).json(successResponse(200, 'Jobs fetched successfully', jobs));
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json(errorResponse(500, 'Failed to get jobs', error.message));
  }
};


// Update a job
module.exports.updateJob = async (req, res) => {
  try {
    const updatedJob = await JobModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedJob) 
      res.status(404).json(errorResponse(404, 'Job not found'));

    res.status(200).json(successResponse(200, 'Job updated successfully', updatedJob));
  } catch (error) {
    console.error('Update Job Error:', error);
    res.status(500).json(errorResponse(500, 'Failed to update job', error.message));
  }
};

// Delete a job
module.exports.deleteJob = async (req, res) => {
  try {
    const deletedJob = await JobModel.findByIdAndDelete(req.params.id);
    if (!deletedJob) 
      res.status(404).json(successResponse(404, 'Job not found'));

    res.status(200).json(successResponse(200, 'Job deleted successfully', deletedJob));
  } catch (error) {
    console.error('Delete Job Error:', error);
    res.status(500).json(errorResponse(500, 'Failed to delete job', error.message));
  }
};
