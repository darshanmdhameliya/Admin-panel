import addressModel from "../models/addressModel.js";

class AddressServices {
    // Get Address by User ID
    async getAddressByUserId(userId) {
        return await addressModel.findOne({ userId });
    }

    //getAllAddress
    async getAllAddress() {
        try {
            return await addressModel.find()
        } catch (error) {
            return error.message;
        }
    }

    // Add Address
    async addAddress(addressData) {
        const newAddress = new addressModel(addressData);
        return await newAddress.save();
    }

    // Update Address
    async updateAddress(userId, addressData) {
        return await addressModel.findOneAndUpdate({ userId }, addressData, { new: true });
    }

    // Delete Address
    async deleteAddress(userId) {
        return await addressModel.findOneAndDelete({ userId });
    }
}

export default AddressServices;