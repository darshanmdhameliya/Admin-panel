import express from 'express';
import { addAddress, getAddress, getAllAddress, updateAddress } from '../controllers/addressController.js';

const addressRoutes = express.Router();

// Address routes
addressRoutes.post('/addAddress', addAddress);
addressRoutes.get('/getAddress/:id', getAddress);
addressRoutes.put('/updateAddress', updateAddress);
addressRoutes.get('/getAllAddress', getAllAddress);

export default addressRoutes;