import express from "express";
import { addNewOrder, getAllOrder, getOrderPayments, sellerAcceptOrder, updateOrder } from "../controllers/orderController.js";
import sellerAuth from "../middlerware/auth.js";


const ordersRoutes = express.Router();

ordersRoutes.post("/addNewOrder", addNewOrder);
ordersRoutes.get("/getAllOrder", getAllOrder);
ordersRoutes.put("/updateOrder/:id", updateOrder);

//order accepted
ordersRoutes.put("/sellerAcceptOrder/:id", sellerAuth, sellerAcceptOrder);

//payment status
ordersRoutes.get("/getOrderPayments", getOrderPayments);

export default ordersRoutes;
