import couponsModel from "../models/couponsModel.js";

class CouponServices {
    // Add Coupon
    async addNewCoupon(body) {
        try {
            return await couponsModel.create(body);
        } catch (error) {
            return error.message;
        }
    }

    // Get Single Coupon
    async getCoupon(body) {
        try {
            return await couponsModel.findOne(body);
        } catch (error) {
            return error.message;
        }
    }

    // Get All Coupons
    async getAllCoupons() {
        try {
            return await couponsModel.find();
        } catch (error) {
            return error.message;
        }
    }

    // Update Coupon
    async updateCoupon(id, body) {
        try {
            return await couponsModel.findByIdAndUpdate(id, { $set: body }, { new: true });
        } catch (error) {
            return error.message;
        }
    }
}

export default CouponServices;