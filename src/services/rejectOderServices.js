import rejectOrderModel from "../models/rejectOrderModel.js";

class RejectOrderServices {
    // Create Rejection
    async createRejection(body) {
        try {
            const { orderId, reason, comment } = body;

            // Basic validation
            if (!orderId || !reason || !comment) {
                throw new Error("All fields are required");
            }

            const rejectedOrder = new rejectOrderModel({
                orderId,
                reason,
                comment,
                status: 'rejected',
            });

            return await rejectedOrder.save();
        } catch (error) {
            return error.message;
        }
    }

    //reject order
    async rejectOrder(orderId, reason) {
        try {
            const rejectedOrder = new rejectOrderModel({
                orderId,
                reason,
                status: 'rejected',
            });
            return await rejectedOrder.save();
        } catch (error) {
            return error.message;
        }
    }
   // Get Rejected Order by ID
    async getRejectedOrderById(id) {
        try {
            return await rejectOrderModel.findById(id);
        } catch (error) {
            return error.message;
        }
    }

    // Get All Rejected Orders
    async getAllRejectedOrders() {
        try {
            return await rejectOrderModel.find();
        } catch (error) {
            return error.message;
        }
    }

    // Update Rejected Order
    async updateRejectedOrder(id, body) {
        try {
            return await rejectOrderModel.findByIdAndUpdate(id, { $set: body }, { new: true });
        } catch (error) {
            return error.message;
        }
    }

    // Delete Rejected Order
    async deleteRejectedOrder(id) {
        try {
            return await rejectOrderModel.findByIdAndDelete(id);
        } catch (error) {
            return error.message;
        }
    }
}

export default RejectOrderServices;