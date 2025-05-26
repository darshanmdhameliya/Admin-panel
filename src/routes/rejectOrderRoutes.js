import express from 'express';
import { deleteRejectedOrder, getRejectedOrderById, getRejectedOrders, rejectOrder, updateRejectedOrder } from '../controllers/rejectOrderController.js';

const rejectOrderRoutes = express.Router();

// Reject order route
rejectOrderRoutes.post('/rejectOrder', rejectOrder);
rejectOrderRoutes.get('/getRejectedOrders', getRejectedOrders);
rejectOrderRoutes.get('/getRejectedOrderById/:id', getRejectedOrderById);
rejectOrderRoutes.put('/updateRejectedOrder/:id', updateRejectedOrder);
rejectOrderRoutes.delete('/deleteRejectedOrder/:id', deleteRejectedOrder);

export default rejectOrderRoutes;