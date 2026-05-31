import express from 'express';
import { getAttendance, getEmployeeById, getEmployees, getEmployeeSalary, punchAttendance, createEmployee, getRoles, createRole, getAttendanceReport } from '../controller/employeeControllers.js';

const route = express.Router();

route.post('/attendance', punchAttendance);
 
route.get('/attendance', getAttendance);

route.get('/attendance-report/:startDate/:endDate', getAttendanceReport);

// Get the employee roles in the database
route.get('/roles', getRoles);
route.post('/roles', createRole);

// Insert new employee data in employee table
route.post('/', createEmployee);

// Get the employee Salary
route.get('/salary', getEmployeeSalary);

route.get('/', getEmployees);

route.get('/:id', getEmployeeById);

export default route;