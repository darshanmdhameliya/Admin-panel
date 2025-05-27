import express from 'express';
import { getDashboardSummary } from '../controllers/dashboradController.js';

const dashboardRoutes = express.Router();

// Route to get dashboard summary
dashboardRoutes.get('/getDashboardSummary', getDashboardSummary);

export default dashboardRoutes;