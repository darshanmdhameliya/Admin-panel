
import express from "express";
import sellerRoutes from "../routes/sellerRoutes.js";

const sellerRoute = express.Router();

//User Route
sellerRoute.use("/sellers", sellerRoutes);

export default sellerRoute
