import express from "express";
import { addNewOrder, getAllOrder, orderAccepted } from "../controllers/orderController.js";
import sellerAuth from "../middlerware/auth.js";


const ordersRoutes = express.Router();

ordersRoutes.post("/addNewOrder", addNewOrder);
ordersRoutes.get("/getAllOrder", getAllOrder);

//order accepted
ordersRoutes.put("/orderAccepted/:id", sellerAuth, orderAccepted);


export default ordersRoutes;
