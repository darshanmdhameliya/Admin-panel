import categoryModel from "../models/categoryModel.js";
import CategoryServices from "../services/categoryServices.js";
import { ThrowError } from "../utils/ErrorUtils.js";
import fs from 'fs';
import path from 'path';

const categoryServices = new CategoryServices()

//adad Category
export const createCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;
        const categoryImage = req.file?.path;

        const checkCategoryNameIsExist = await categoryServices.getCategory({ categoryName });
        if (checkCategoryNameIsExist) {
            if (categoryImage && fs.existsSync(categoryImage)) {
                fs.unlinkSync(categoryImage);
            }

            return ThrowError(res, 400, "Category Name already exists");
        }

        // Create new category
        const newCategory = new categoryModel({
            categoryImage,
            categoryName,
        });

        await newCategory.save();

        return res.status(201).json({
            message: "Category created successfully",
            data: newCategory,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

//getCategory
export const getCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await categoryModel.findById(id);

        if (!category) {
            return ThrowError(res, 404, "Category not found");
        }

        return res.status(200).json({
            message: "Category fetched successfully",
            data: category,
        });

    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

//getAllCategory
export const getAllCategory = async (req, res) => {
    try {
        const categories = await categoryModel.find().sort({ createdAt: -1 });

        if (!categories || categories.length === 0) {
            return res.status(200).json({
                message: "No any Category added",
                data: [],
            });
        }

        return res.status(200).json({
            message: "All categories fetched successfully",
            data: categories,
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};


export const updateCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryName } = req.body;
        const newImagePath = req.file?.path;

        const existingCategory = await categoryModel.findById(id);
        if (!existingCategory) {
            return ThrowError(res, 404, "Category not found");
        }

        if (categoryName && categoryName !== existingCategory.categoryName) {
            const isNameExist = await categoryServices.getCategory({ categoryName });
            if (isNameExist) {
                return ThrowError(res, 400, "Category name already exists");
            }
            existingCategory.categoryName = categoryName;
        }

        if (newImagePath) {
            if (existingCategory.categoryImage && fs.existsSync(existingCategory.categoryImage)) {
                fs.unlinkSync(existingCategory.categoryImage);
            }

            existingCategory.categoryImage = newImagePath;
        }

        await existingCategory.save();

        return res.status(200).json({
            message: "Category updated successfully",
            data: existingCategory
        });

    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};


export const deleteCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await categoryModel.findById(id);
        if (!category) {
            return ThrowError(res, 404, "Category not found");
        }

        if (category.categoryImage) {
            const imagePath = path.resolve(category.categoryImage);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await categoryModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Category deleted successfully"
        });

    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};