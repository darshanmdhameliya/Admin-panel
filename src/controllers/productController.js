import productModel from "../models/productModel.js";
import { ThrowError } from "../utils/ErrorUtils.js";
import ProductServices from "../services/productServices.js";

const productServices = new ProductServices();

//adproduct
export const addNewProduct = async (req, res) => {
    try {
        const { category, product_name, price, discount, unit, quantity, product_description, createdBy } = req.body;
        const product = await productServices.getProduct({ product_name });
        if (product) {
            return await ThrowError(res, 400, "Product already exists");
        }
        const files = req.files && req.files['productimage'] ? req.files['productimage'] : [];

        const newProduct = new productModel({
            productimage: files,
            category,
            product_name,
            price,
            discount,
            unit,
            quantity,
            product_description,
            createdBy
        });

        await newProduct.save();

        return res.status(201).json({
            message: "Product added successfully",
            data: newProduct,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}

//getproduct
export const getAllProducts = async (req, res) => {
    try {
        const products = await productServices.getAllProducts();
        return res.status(200).json({
            message: "Products fetched successfully",
            data: products,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}

//putProduct
export const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { category, product_name, price, discount, unit, quantity, product_description, createdBy } = req.body;
        const updateData = {
            category,
            product_name,
            price,
            discount,
            unit,
            quantity,
            product_description,
            createdBy
        };

        const productdata = await productModel.findByIdAndUpdate(id, updateData, { new: true });


        if (!productdata) {
            return res.status(404).json({ message: "product not found" });
        }
        res.status(200).json(productdata);
    } catch (error) {

        return ThrowError(res, 500, error.message);
    }
};

//deleteProduct
export const deleteProduct = async (req, res) => {
    try {
        const _id = req.params.id;
        const productdata = await productModel.findByIdAndDelete(_id);
        if (!productdata) {
            return res.status(404).json({ message: "product not found" });
        }
        res.status(200).json({ message: "product deleted successfully" });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

//getProductById
export const getProductById = async (req, res) => {
    try {
        const _id = req.params.id;
        const productdata = await productModel.findById(_id);
        if (!productdata) {
            return res.status(404).json({ message: "product not found" });
        }
        res.status(200).json(productdata);
    }
    catch (error) {
        return ThrowError(res, 500, error.message);
    }
}
