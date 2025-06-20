const express = require('express');
const {createPlan, getAllPlans,getPlanById, updatePlan, deletePlan} = require('../controllers/PlanController');
const planRoutes = express.Router();

// Create
planRoutes.post('/CreatePlan', createPlan);

// Read all
planRoutes.get('/GetAllPlans', getAllPlans);

// Read one
planRoutes.get('/GetPlanById/:id', getPlanById);

// Update
planRoutes.put('/UpdatePlan/:id', updatePlan);

// Delete
planRoutes.delete('/DeletePlan/:id', deletePlan);

module.exports = planRoutes;
