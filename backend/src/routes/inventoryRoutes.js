import express from 'express';
import { addIngredient, addWasteItem, addSupplier, addSupplierIngredient, getSuppliers, getSupplierIngredients, updateIngredient, getIngredients, getWasteItems } from '../controller/inventoryControllers.js';

const route = express.Router();


// Select stock report
route.get("/ingredient", getIngredients);

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
 * Description: Get all waste items
 */
route.get("/waste", getWasteItems);

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
route.get("/supplier", getSuppliers);
route.get("/supplier-ingredient", getSupplierIngredients);
route.post("/supplier", addSupplier);
route.post("/supplier-ingredient", addSupplierIngredient);

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