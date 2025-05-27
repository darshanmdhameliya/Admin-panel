import express from 'express';
import { addNewUser, deleteUser, getAllUsers, getUserById, loginUser, updateUser } from '../controllers/userController.js';


const userRoutes = express.Router();

userRoutes.post('/addUser', addNewUser);
userRoutes.post('/loginUser', loginUser);
userRoutes.get('/getUserById/:id', getUserById);
userRoutes.put('/updateUser/:id', updateUser);
userRoutes.delete('/deleteUser/:id', deleteUser);
userRoutes.get('/getAllUsers', getAllUsers);

export default userRoutes;