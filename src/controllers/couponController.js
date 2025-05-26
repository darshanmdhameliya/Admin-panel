import express from 'express';
import couponsModel from '../models/couponsModel.js';
import { ThrowError } from "../utils/ErrorUtils.js";
import CouponServices from '../services/couponServices.js';
const couponServices = new CouponServices();

// Add Coupon
export const addNewCoupon = async (req, res) => {
    try {
        const { coupon_code, discount } = req.body;
        const existingCoupon = await couponServices.getCoupon({ coupon_code });
        if (existingCoupon) {
            return await ThrowError(res, 400, "Coupon already exists");
        }
        const newCoupon = new couponsModel({
            coupon_code,
            discount,
        });

        await newCoupon.save();

        return res.status(201).json({
            message: "Coupon added successfully",
            data: newCoupon,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}

// Get Single Coupon
export const getCoupon = async (req, res) => {
    try {
        const coupon = await couponServices.getCoupon(req.body);
        if (!coupon) {
            return await ThrowError(res, 404, "Coupon not found");
        }
        return res.status(200).json({
            message: "Coupon fetched successfully",
            data: coupon,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}

// Get All Coupons
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await couponServices.getAllCoupons();
        return res.status(200).json({
            message: "Coupons fetched successfully",
            data: coupons,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}

// Update Coupon
export const updateCoupon = async (req, res) => {
    try {
        const id = req.params.id;
        const { coupon_code, discount } = req.body;
        const updatedCoupon = await couponServices.updateCoupon(id, { coupon_code, discount });
        if (!updatedCoupon) {
            return await ThrowError(res, 404, "Coupon not found");
        }
        return res.status(200).json({
            message: "Coupon updated successfully",
            data: updatedCoupon,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}
// Delete Coupon
export const deleteCoupon = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedCoupon = await couponsModel.findByIdAndDelete(id);
        if (!deletedCoupon) {
            return await ThrowError(res, 404, "Coupon not found");
        }
        return res.status(200).json({
            message: "Coupon deleted successfully",
            data: deletedCoupon,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}
