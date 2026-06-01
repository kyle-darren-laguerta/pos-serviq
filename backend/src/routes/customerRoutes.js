import express from 'express';
import { getCustomers, createCustomer } from '../controller/customerControllers.js';

const route = express.Router();

route.get('/', getCustomers);
route.post('/', createCustomer);

export default route;
