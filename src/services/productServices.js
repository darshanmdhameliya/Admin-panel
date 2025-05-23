import product from "../models/productModel.js";

class ProductServices {
    //Add Product
    async addNewProduct(body) {
        try {
            return await product.create(body);
        } catch (error) {
            return error.message;
        }
    }
    //Get Single Product
    async getProduct(body) {
        try {
            return await product.findOne(body);
        } catch (error) {
            return error.message;
        }
    }
    //Get Single Product By Id
    async getProductById(id) {
        try {
            return await product.findById(id);
        } catch (error) {
            return error.message;
        }
    }
    //Get All Products
    async getAllProducts(body) {
        try {
            return await product.find(body);
        }
        catch (error) {
            console.log(error);
            return error.message;
        }
    }
    //Update Product
    async updateProduct(id, body) {
        try {
            return await product
                .findByIdAndUpdate(id, { $set: body }, { new: true });
        }
        catch (error) {
            return error.message;
        }
    }
    //Delete Product
    async deleteProduct(id) {
        try {
            return await product.findByIdAndDelete(id);
        } catch (error) {
            return error.message;
        }
    }

    //Get Product By Name
    async getProductByName(name) {
        try {
            return await product
                .find({ name })
                .sort({ createdAt: -1 });
        }
        catch (error) {
            return error.message;
        }
    }

    //Get Product By Image  
    async getProductByImage(image) {
        try {
            return await product
                .find({ image })
                .sort({ createdAt: -1 });
        }
        catch (error) {
            return error.message;
        }
    }
}

export default ProductServices;
