import express from 'express';
import { addNewUser, loginUser } from '../controllers/userController.js';


const userRoutes = express.Router();

userRoutes.post('/addUser', addNewUser);
userRoutes.post('/loginUser', loginUser);

export default userRoutes;