import express from "express";
import {
  addNewProduct,
  getAllProducts,
  editProduct,
  deleteProduct,
  getProductById,
} from "../controllers/productController.js";
import upload, { convertJfifToJpeg } from "../middlerware/imageupload.js";
import sellerAuth from "../middlerware/auth.js";

const productRoutes = express.Router();

// Product routes
productRoutes.post("/addNewProduct", upload.fields([{ name: "productimage" }]), convertJfifToJpeg, addNewProduct);
productRoutes.get("/getAllProducts", sellerAuth, getAllProducts);
productRoutes.put("/editProduct/:id", upload.single('categoryImage'), sellerAuth, editProduct);
productRoutes.delete("/deleteProduct/:id", sellerAuth, deleteProduct);
productRoutes.get("/getProductById/:id", sellerAuth, getProductById);

export default productRoutes;
