import inventoryModel from "../models/inventoryModel.js";

class InventoryServices {

    // Get Single Inventory Item
    async getInventoryItemById(id) {
        try {
            return await inventoryModel.findById(id);
        } catch (error) {
            return error.message;
        }
    }
    //get inventory item by productId
    async getInventoryItemByProductId({productId}) {
        try {
            return await inventoryModel.findOne({ productId });
        } catch (error) {
            return error.message;
        }
    }


    // Get All Inventory Items
    async getAllInventoryItems() {
        try {
            return await inventoryModel.find();
        } catch (error) {
            return error.message;
        }
    }

    // Update Inventory Item
    async updateInventoryItem(id, body) {
        try {
            return await inventoryModel.findByIdAndUpdate(id, { $set: body }, { new: true });
        } catch (error) {
            return error.message;
        }
    }

    // Delete Inventory Item
    async deleteInventoryItem(id) {
        try {
            return await inventoryModel.findByIdAndDelete(id);
        } catch (error) {
            return error.message;
        }
    }
}

export default InventoryServices;