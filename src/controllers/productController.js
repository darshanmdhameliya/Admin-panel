import fs from 'fs';
import path from 'path';
import productModel from "../models/productModel.js";
import categoryModel from '../models/categoryModel.js';
import { ThrowError } from "../utils/ErrorUtils.js";
import ProductServices from "../services/productServices.js";


const productServices = new ProductServices();

//adproduct

export const addNewProduct = async (req, res) => {
    try {
        const {
            category,
            product_name,
            price,
            discount,
            unit,
            quantity,
            product_description,
            createdBy,
            Health_Benefits,
            Storage_Use
        } = req.body;

        const productImages = req.files?.productimage || [];

        // Check if the category ID is valid
        const categoryExists = await categoryModel.findById(category);
        if (!categoryExists) {
            for (const file of productImages) {
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }

            return ThrowError(res, 400, "Invalid category ID");
        }

        // Check if product already exists
        const product = await productServices.getProduct({ product_name });
        if (product) {
            // 🧹 Delete uploaded images if product already exists
            for (const file of productImages) {
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }

            return ThrowError(res, 400, "Product already exists");
        }

        // Create new product
        const newProduct = new productModel({
            productimage: productImages,
            category,
            product_name,
            price,
            discount,
            unit,
            quantity,
            product_description,
            createdBy,
            Health_Benefits,
            Storage_Use
        });

        await newProduct.save();

        return res.status(201).json({
            message: "Product added successfully",
            data: newProduct,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};
//getproduct
export const getAllProducts = async (req, res) => {
    try {
        const products = await productServices.getAllProducts();

        if (!products || products.length === 0) {
            return res.status(200).json({
                message: "No any Product added",
                data: [],
            });
        }

        return res.status(200).json({
            message: "Products fetched successfully",
            data: products,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

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
            return res.status(404).json({ message: "Product not found" });
        }

        let images = [];

        if (Array.isArray(productdata.productimage)) {
            images = productdata.productimage.map(img =>
                typeof img === 'string' ? img : img.path
            );
        } else if (typeof productdata.productimage === 'string') {
            images = [productdata.productimage];
        } else if (typeof productdata.productimage === 'object' && productdata.productimage?.path) {
            images = [productdata.productimage.path];
        }

        for (const imagePath of images) {
            if (imagePath) {
                const absolutePath = path.resolve(imagePath);
                if (fs.existsSync(absolutePath)) {
                    fs.unlinkSync(absolutePath);
                }
            }
        }

        return res.status(200).json({ message: "Product deleted successfully" });

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
