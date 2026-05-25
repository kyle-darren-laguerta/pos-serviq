import express from 'express';
import { addAddon, addMenu, getAddon, getMenu, updateAddon, updateMenuItem } from '../controller/menuControllers.js';

const route = express.Router();

/**
 * Description: Get the all the menuItem
 * Status: Working
 */
route.get('/item', getMenu);

/**
 * Description: Add menu item
 * Status: Working
 */
route.post('/item', addMenu);

/**
 * Description: Modfiy menu item
 * Status: Working
 */
route.patch('/item/:id', updateMenuItem);

/**
 * Description: Get all the addon
 * Status: Working
 */
route.get('/addon', getAddon);

/**
 * Description: Add Addon
 * Status: Working
 */
route.post('/addon', addAddon);

/**
 * Description: Modify addon item
 * Status: Working
 */
route.patch('/addon/:id', updateAddon);

/**
 * Description: Update addon item (PUT)
 * Status: Working
 * Request Body Structure (Optional):
    {
        name: "Extra Rice"
        price: 25
    }
 */
route.put('/addon/:id', updateAddon);

export default route;