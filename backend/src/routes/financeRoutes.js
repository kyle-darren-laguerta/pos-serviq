import express from 'express';
import { getExpenses, getRevenue } from '../controller/financeController.js';

const route = express.Router();

route.get('/revenue/:startDate/:endDate', getRevenue);
route.get('/expenses/:startDate/:endDate', getExpenses);

export default route;