const express = require('express');
const {createJob, getAllJobs, getJobById, updateJob, deleteJob} = require('../controllers/JobController');
const jobRoutes = express.Router();

// CRUD routes
jobRoutes.post('/CreateJob', createJob);
jobRoutes.get('/GetJobByid/:id', getJobById);
jobRoutes.get('/GetAllJobs', getAllJobs);
jobRoutes.put('/UpdateJob/:id', updateJob);
jobRoutes.delete('/DeleteJob/:id', deleteJob);

module.exports = jobRoutes;