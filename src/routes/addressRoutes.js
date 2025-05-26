import express from 'express';
import { addAddress, getAddress, updateAddress } from '../controllers/addressController.js';

const addressRoutes = express.Router();

// Address routes
addressRoutes.post('/addAddress', addAddress);
addressRoutes.get('/getAddress/:id', getAddress);
addressRoutes.put('/updateAddress', updateAddress);

export default addressRoutes;