import { ThrowError } from '../utils/ErrorUtils.js';
import RejectOrderServices from '../services/rejectOderServices.js';
import rejectOrderModel from '../models/rejectOrderModel.js';
import ordermodel from '../models/orderModel.js';

const rejectOrderServices = new RejectOrderServices();

//when i reject an order, at time orderstatus will be updated to rejected
export const rejectOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { reason, comment } = req.body;

        // Validate input
        if (!orderId || !reason || !comment) {
            return res.status(400).json({
                status: false,
                message: 'Order ID, reason, and comment are required'
            });
        }

        // Check if order exists
        const order = await ordermodel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                status: false,
                message: 'Order not found'
            });
        }

        // Check if already rejected
        if (order.orderStatus === 'rejected') {
            return res.status(400).json({
                status: false,
                message: 'Order has already been rejected'
            });
        }

        // Update order status
        order.orderStatus = 'rejected';
        await order.save();

        // Log rejection reason
        const rejectedOrder = await rejectOrderModel.create({
            orderId,
            reason,
            comment,
            orderStatus: 'rejected'
        });

        return res.status(200).json({
            status: true,
            message: 'Order rejected successfully',
            data: {
                updatedOrder: order,
                rejectionLog: rejectedOrder
            }
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
