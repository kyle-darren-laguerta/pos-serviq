import express from 'express';
import { 
    getFoodPackages, 
    getFoodPackageById, 
    createFoodPackage 
} from '../controller/foodPackageControllers.js';

const route = express.Router();

/**
 * Description: Get all food packages with menu items
 * Status: Working
 */
route.get('/', getFoodPackages);

/**
 * Description: Get a specific food package by ID
 * Status: Working
 */
route.get('/:id', getFoodPackageById);

/**
 * Description: Create a new food package
 * Status: Working
 */
route.post('/', createFoodPackage);

export default route;
