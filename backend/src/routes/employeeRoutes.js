import express from 'express';
import { getAttendance, getEmployeeById, getEmployees, getEmployeeSalary, punchAttendance, createEmployee, getRoles } from '../controller/employeeControllers.js';

const route = express.Router();

route.post('/attendance', punchAttendance);
route.get('/attendance', getAttendance);
route.get('/roles', getRoles);
route.post('/', createEmployee);

route.get('/salary', getEmployeeSalary);

route.get('/', getEmployees);

route.get('/:id', getEmployeeById);

export default route;