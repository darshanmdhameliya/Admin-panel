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

