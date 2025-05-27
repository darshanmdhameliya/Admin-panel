import express from 'express';
import { addInventory, deleteInventoryItem, getAllInventoryItems, getInventoryItem, updateInventoryItem } from '../controllers/inventoryController.js';

const inventoryRoutes = express.Router();

// Route to add inventory
inventoryRoutes.post('/addInventory', addInventory);
inventoryRoutes.get('/getInventoryItem/:id', getInventoryItem);
inventoryRoutes.get('/getAllInventoryItems',getAllInventoryItems);
inventoryRoutes.put('/updateInventoryItem/:id', updateInventoryItem);
inventoryRoutes.delete('/deleteInventoryItem/:id', deleteInventoryItem);


export default inventoryRoutes;