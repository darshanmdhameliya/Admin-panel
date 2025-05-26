import { ThrowError } from '../utils/ErrorUtils.js';
import RejectOrderServices from '../services/rejectOderServices.js';
import OrderServices from '../services/orderServices.js';
import rejectOrderModel from '../models/rejectOrderModel.js';

const rejectOrderServices = new RejectOrderServices();
const orderServices = new OrderServices();

// Reject Order
export const rejectOrder = async (req, res) => {
    const { orderId, reason, comment } = req.body;

    // Basic validation
    if (!orderId || !reason || !comment) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Create and save the rejection
        const rejection = new rejectOrderModel({
            orderId,
            reason,
            comment
        });

        await rejection.save();

        res.status(201).json({
            message: "Order rejected successfully",
            data: rejection
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get Rejected Orders
export const getRejectedOrders = async (req, res) => {
    try {
        const rejectedOrders = await rejectOrderServices.getAllRejectedOrders();
        if (!rejectedOrders || rejectedOrders.length === 0) {
            return res.status(404).json({ message: "No rejected orders found" });
        }
        res.status(200).json({
            message: "Rejected orders fetched successfully",
            data: rejectedOrders
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get Rejected Order by ID
export const getRejectedOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        const rejectedOrder = await rejectOrderServices.getRejectedOrderById(id);
        if (!rejectedOrder) {
            return res.status(404).json({ message: "Rejected order not found" });
        }
        res.status(200).json({
            message: "Rejected order fetched successfully",
            data: rejectedOrder
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Update Rejected Order
export const updateRejectedOrder = async (req, res) => {
    const { id } = req.params;
    const { reason, comment } = req.body;

    // Basic validation
    if (!reason || !comment) {
        return res.status(400).json({ message: "Reason and comment are required" });
    }

    try {
        const updatedOrder = await rejectOrderServices.updateRejectedOrder(id, { reason, comment });
        if (!updatedOrder) {
            return res.status(404).json({ message: "Rejected order not found" });
        }
        res.status(200).json({
            message: "Rejected order updated successfully",
            data: updatedOrder
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Delete Rejected Order
export const deleteRejectedOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedOrder = await rejectOrderServices.deleteRejectedOrder(id);
        if (!deletedOrder) {
            return res.status(404).json({ message: "Rejected order not found" });
        }
        res.status(200).json({
            message: "Rejected order deleted successfully",
            data: deletedOrder
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};
