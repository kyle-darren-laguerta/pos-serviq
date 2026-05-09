import express from 'express';
import { createBulkOrder, createReceipt, createReservation, updateReservation } from '../controller/orderControllers.js';

const route = express.Router();

/**
 * Description: Create an Order
 * Status: Working
 */
route.post('/', createBulkOrder); // Under development

// Add receipt
/**
 * Description: Add receipt
 * Status: Working
 */
route.post('/receipt', createReceipt);

// Add Reservation
/**
 * Description: Add receipt
 * Status: Not Tested
 */
route.post('/reservation', createReservation);

// Update reservation
/**
 * Description: Add receipt
 * Status: Not Tested
 * To Do:
 *      - Add Record to reservation_package table
 */
route.put('/reservation/:id', updateReservation);

export default route;