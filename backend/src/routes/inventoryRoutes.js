import express from 'express';
import { addIngredient, addWasteItem, addSupplier, updateIngredient } from '../controller/inventoryControllers.js';

const route = express.Router();

// Select stock report

/**
 * Description: Add ingredient
 * Status: Not Tested
 */
route.post("/ingredient", addIngredient);

/**
 * Description: Add waste item
 * Status: Not Tested
 * TODO
 *  - decrease ingredient stock
 * Request Body Structure:
 * {
 *   quantity: 2.5,
 *   reason_category: "Spoiled",
 *   ingredient_id: 1,
 *   waste_date: "2026-05-04"
 * }
 */
route.post("/waste", addWasteItem);

/**
 * Description: Add supplier
 * Status: Not Tested
 * Request Body Structure:
 * {
 *   supplier_name: "Fresh Farms",
 *   contact_number: "09171234567",
 *   supplier_address: "123 Market St"
 * }
 */
route.post("/supplier", addSupplier);

/**
 * Description: Update ingredient attributes by ID
 * Status: Not Tested
 * Request Body Structure (Optional):
    {
        name: "Brown Sugar"
        unitOfMeasurement: "kg"
        minStock: 1
        costPerUnit: 35
        currentStock: 2.5
    }
 */
route.put("/ingredient/:id", updateIngredient);

export default route;