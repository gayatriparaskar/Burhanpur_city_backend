// src/routes/DashboardRouter.js
const express = require('express');

const { getOverviewStats } = require('../controllers/DashboardController');

const DashRouter = express.Router();

DashRouter.get("/overview/:id",getOverviewStats);
module.exports = DashRouter;