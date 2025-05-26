import express from "express";
import {
  addNewProduct,
  getAllProducts,
  editProduct,
  deleteProduct,
  getProductById,
} from "../controllers/productController.js";
import upload from "../middlerware/imageupload.js";
import sellerAuth from "../middlerware/auth.js";

const productRoutes = express.Router();

// Product routes
productRoutes.post(
  "/addNewProduct",
  upload.fields([{ name: "productimage" }]),
  addNewProduct
);
productRoutes.get("/getAllProducts", sellerAuth, getAllProducts);
productRoutes.put("/editProduct/:id", sellerAuth, editProduct);
productRoutes.delete("/deleteProduct/:id", sellerAuth, deleteProduct);
productRoutes.get("/getProductById/:id", sellerAuth, getProductById);

export default productRoutes;
