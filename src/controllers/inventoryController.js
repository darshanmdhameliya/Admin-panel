import mongoose from 'mongoose';
import inventoryModel from '../models/inventoryModel.js';
import { ThrowError } from "../utils/ErrorUtils.js";
import InventoryServices from '../services/inventoryServices.js';
const inventoryServices = new InventoryServices();

//add new inventory item
export const addInventory = async (req, res) => {
    try {
        const { category, productId, quantity, Low_stock_limit, createdBy } = req.body;

        if (!category || !productId || quantity == null || Low_stock_limit == null) {
            return res.status(400).json({
                status: false,
                message: 'All required fields must be provided'
            });
        }

        const existing = await inventoryServices.getInventoryItemByProductId({ productId });

        if (existing) {
            // Update the existing inventory
            const updated = await inventoryModel.findOneAndUpdate(
                { productId },
                {
                    $set: {
                        category,
                        quantity,
                        Low_stock_limit,
                        updatedBy: createdBy
                    }
                },
                { new: true }
            );

            return res.status(200).json({
                status: true,
                message: 'Inventory updated successfully',
                data: updated
            });
        }

        // Create new inventory
        const newItem = await inventoryModel.create({
            category,
            productId,
            quantity,
            Low_stock_limit,
            createdBy,
            updatedBy: createdBy
        });

        res.status(201).json({
            status: true,
            message: 'Inventory item added successfully',
            data: newItem
        });
    } catch (error) {
        return ThrowError(res, 500, error.message || 'Server Error');
    }
};

//get single inventory item
export const getInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            return res.status(400).json({
                status: false,
                message: 'Inventory ID is required'
            });
        }

        // Aggregation pipeline
        const inventoryItem = await inventoryModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            },
            {
                $project: {
                    _id: 1,
                    date: 1,
                    quantity: 1,
                    inventoryUnit: '$unit',
                    amount: 1,
                    productName: '$productDetails.product_name',
                    price: '$productDetails.price',
                    productUnit: '$productDetails.unit',
                    productImage: '$productDetails.productimage',
                    totalQuantity: '$productDetails.quantity'
                }
            }
        ]);

        if (!inventoryItem || inventoryItem.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Inventory item not found'
            });
        }

        res.status(200).json({
            status: true,
            message: 'Inventory item retrieved successfully',
            data: inventoryItem[0]
        });

    } catch (error) {
        return ThrowError(res, 500, error.message || 'Server Error');
    }
};


//get all inventory items
export const getAllInventoryItems = async (req, res) => {
    try {
        const inventoryItems = await inventoryServices.getAllInventoryItems();
        if (inventoryItems.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No inventory items found'
            });
        }

        res.status(200).json({
            status: true,
            message: 'All inventory items retrieved successfully',
            data: inventoryItems
        });
    } catch (error) {
        return ThrowError(res, 500, error.message || 'Server Error');
    }
};

//update inventory item
export const updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const {category, quantity, Low_stock_limit, updatedBy } = req.body;

        const updatedItem = await inventoryServices.updateInventoryItem(
            id,
            {category, quantity, Low_stock_limit, updatedBy },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({
                status: false,
                message: 'Inventory item not found'
            });
        }

        res.status(200).json({
            status: true,
            message: 'Inventory item updated successfully',
            data: updatedItem
        });
    } catch (error) {
        return ThrowError(res, 500, error.message || 'Server Error');
    }
};

//delete inventory item
export const deleteInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            return res.status(400).json({
                status: false,
                message: 'Inventory ID is required'
            });
        }

        const deletedItem = await inventoryServices.deleteInventoryItem(id);
        if (!deletedItem) {
            return res.status(404).json({
                status: false,
                message: 'Inventory item not found'
            });
        }

        res.status(200).json({
            status: true,
            message: 'Inventory item deleted successfully',
            data: deletedItem
        });
    } catch (error) {
        return ThrowError(res, 500, error.message || 'Server Error');
    }
};
