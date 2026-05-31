import express from 'express';
import { getExpenses, getRevenue, getPartTimeSalaryReport, getMonthlyItemSold } from '../controller/financeController.js';

const route = express.Router();

route.get('/revenue/:startDate/:endDate', getRevenue);
route.get('/expenses/:startDate/:endDate', getExpenses);
route.get('/parttime-salary/:startDate/:endDate', getPartTimeSalaryReport);
route.get('/monthly-item-sold/:startDate/:endDate', getMonthlyItemSold);

export default route;