import mongoose from "mongoose";
import addressModel from "../models/addressModel.js";
import { ThrowError } from "../utils/ErrorUtils.js";
import AddressServices from "../services/addressServices.js";

const addressServices = new AddressServices();

//add address
export const addAddress = async (req, res) => {
    try {
        const { userId, houseNo, landmark, pincode, city, state, country, save_address } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return await ThrowError(res, 400, "Invalid user ID");
        }
        const existingAddress = await addressServices.getAddressByUserId(userId);
        if (existingAddress) {
            return await ThrowError(res, 400, "Address already exists for this user");
        }
        // Create a new address
        const newAddress = new addressModel({
            userId,
            houseNo,
            landmark,
            pincode,
            city,
            state,
            country,
            save_address
        });

        await newAddress.save();

        return res.status(201).json({
            message: "Address added successfully",
            data: newAddress,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}

//update address
export const updateAddress = async (req, res) => {
    try {
        const { userId, houseNo, landmark, pincode, city, state, country, save_address } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return await ThrowError(res, 400, "Invalid user ID");
        }
        const user = await addressServices.getAddressByUserId(userId);
        if (!user) {
            return await ThrowError(res, 404, "User not found");
        }
        // Update the user's address
        user.houseNo = houseNo;
        user.landmark = landmark;
        user.pincode = pincode;
        user.city = city;
        user.state = state;
        user.country = country;
        user.save_address = save_address;

        await user.save();

        return res.status(200).json({
            message: "Address updated successfully",
            data: user,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}

//get address
export const getAddress = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return await ThrowError(res, 400, "Invalid user ID");
        }
        const user = await addressServices.getAddressByUserId(id);
        if (!user) {
            return await ThrowError(res, 404, "User not found");
        }
        return res.status(200).json({
            message: "Address fetched successfully",
            data: {
                houseNo: user.houseNo,
                landmark: user.landmark,
                pincode: user.pincode,
                city: user.city,
                state: user.state,
                country: user.country,
                save_address: user.save_address
            },
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}

//getAll address
export const getAllAddress = async (req, res) => {
    try {
        const address = await addressServices.getAllAddress();
        return res.status(200).json({
            message: "address fetched successfully",
            data: address,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
}
