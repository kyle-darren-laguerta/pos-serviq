import express from 'express';
import { getAttendance, getEmployeeById, getEmployees, getEmployeeSalary } from '../controller/employeeControllers.js';

const route = express.Router();

route.get('/attendance', getAttendance);

route.get('/salary', getEmployeeSalary);

route.get('/', getEmployees);

route.get('/:id', getEmployeeById);

export default route;