import express from "express";
import { addNewOrder, deleteOrder, getAllOrder, getOrderPayments, sellerAcceptOrder, updateOrder } from "../controllers/orderController.js";
import sellerAuth from "../middlerware/auth.js";


const ordersRoutes = express.Router();

ordersRoutes.post("/addNewOrder", addNewOrder);
ordersRoutes.get("/getAllOrder", getAllOrder);
ordersRoutes.put("/updateOrder/:id", updateOrder);
ordersRoutes.delete("/deleteOrder/:id", deleteOrder);

//order accepted
ordersRoutes.put("/sellerAcceptOrder/:id", sellerAuth, sellerAcceptOrder);

//payment status
ordersRoutes.get("/getOrderPayments", getOrderPayments);

export default ordersRoutes;
