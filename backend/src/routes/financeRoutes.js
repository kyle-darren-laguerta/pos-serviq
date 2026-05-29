import express from 'express';
import { getRevenue } from '../controller/financeController.js';

const route = express.Router();

route.get('/revenue/:startDate/:endDate', getRevenue);

export default route;