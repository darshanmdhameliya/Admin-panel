import userModel from "../models/userModel.js";
import { ThrowError } from "../utils/ErrorUtils.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import UserServices from "../services/userServices.js";

const userServices = new UserServices();

// Add User
export const addNewUser = async (req, res) => {
    try {
        const { name, mobileNo, email, password } = req.body;
        const user = await userServices.getUser({ email });
        if (user) {
            return await ThrowError(res, 400, "User already exists");
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user
        const newUser = {
            name,
            mobileNo,
            email,
            password: hashedPassword
        };

        const addUser = new userModel(newUser);
        await addUser.save();



        return res.status(201).json({
            message: "User added successfully",
            userId: addUser._id,
            data: newUser,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}

//login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userServices.getUserByEmail(email);
        if (!user) {
            return await ThrowError(res, 400, "User not found");
        }
        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return await ThrowError(res, 400, "Invalid credentials");
        }
        return res.status(200).json({
            message: "Login successful",
            data: user,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}

// Get User by ID
export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return await ThrowError(res, 400, "Invalid user ID");
        }
        const user = await userServices.getUserById(userId);
        if (!user) {
            return await ThrowError(res, 404, "User not found");
        }
        return res.status(200).json({
            message: "User fetched successfully",
            data: user,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}

// Update User
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, mobileNo, email } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return await ThrowError(res, 400, "Invalid user ID");
        }

        const updatedUser = await userServices.updateUser(userId, { name, mobileNo, email });
        if (!updatedUser) {
            return await ThrowError(res, 404, "User not found");
        }

        return res.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}
// Delete User
export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return await ThrowError(res, 400, "Invalid user ID");
        }

        const deletedUser = await userServices.deleteUser(id);
        if (!deletedUser) {
            return await ThrowError(res, 404, "User not found");
        }

        return res.status(200).json({
            message: "User deleted successfully",
            data: deletedUser,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}
// Get All Users
export const getAllUsers = async (req, res) => {
    try {
        const users = await userServices.getAllUsers();
        return res.status(200).json({
            message: "Users fetched successfully",
            data: users,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}


