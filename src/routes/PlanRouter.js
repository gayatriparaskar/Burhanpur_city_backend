const express = require('express');
const {createPlan, getAllPlans,getPlanById, updatePlan, deletePlan} = require('../controllers/PlanController');
// const { createOrderForPlan, verifyPaymentAndActivatePlan } = require('../controllers/PlanPurchaseController');

const planRoutes = express.Router();


planRoutes.post('/CreatePlan', createPlan);// Create

planRoutes.get('/GetAllPlans', getAllPlans);// Read all

planRoutes.get('/GetPlanById/:id', getPlanById);// Read one

planRoutes.put('/UpdatePlan/:id', updatePlan);// Update

planRoutes.delete('/DeletePlan/:id', deletePlan);// Delete

// planRoutes.post('/CreateOrder', createOrderForPlan);
// planRoutes.post('/Webhook', verifyPaymentAndActivatePlan); // Make this public, no auth middleware


module.exports = planRoutes;
