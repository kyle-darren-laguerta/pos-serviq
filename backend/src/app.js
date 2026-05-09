import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import employeeRouter from './routes/employeeRoutes.js';
import financeRouter from './routes/financeRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import menuRouter from './routes/menuRoutes.js';
import inventoryRouter from './routes/inventoryRoutes.js';
import foodPackageRouter from './routes/foodPackageRoutes.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.use('/employee', employeeRouter);
app.use('/finance', financeRouter);
app.use('/order', orderRouter);
app.use('/menu', menuRouter);
app.use('/inventory', inventoryRouter);
app.use('/food-package', foodPackageRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});