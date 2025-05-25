import express from "express";
import {
  addNewProduct,
  getAllProducts,
  editProduct,
  deleteProduct,
  getProductById,
} from "../controllers/productController.js";
import upload from "../middlerware/imageupload.js";

const productRoutes = express.Router();

// Product routes
productRoutes.post(
  "/addNewProduct",
  upload.fields([{ name: "productimage" }]),
  addNewProduct
);
productRoutes.get("/getAllProducts", getAllProducts);
productRoutes.put("/editProduct/:id", editProduct);
productRoutes.delete("/deleteProduct/:id", deleteProduct);
productRoutes.get("/getProductById/:id", getProductById);

export default productRoutes;
