import categoryModel from "../models/categoryModel.js";

class CategoryServices {
    // Add Category
    async addCategory(body) {
        try {
            return await categoryModel.create(body);
        } catch (error) {
            return error.message;
        }
    }

    // Get Single Category
    async getCategory(body) {
        try {
            return await categoryModel.findOne(body);
        } catch (error) {
            return error.message;
        }
    }

    // Get All Category
    async getAllCategory() {
        try {
            return await categoryModel.find();
        } catch (error) {
            return error.message;
        }
    }

    // Update Category
    async updateCategory(id, body) {
        try {
            return await categoryModel.findByIdAndUpdate(id, { $set: body }, { new: true });
        } catch (error) {
            return error.message;
        }
    }
}

export default CategoryServices;