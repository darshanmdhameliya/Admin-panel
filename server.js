
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./src/config/db.js";
import cookieParser from "cookie-parser";
import sellerRoutes from "./src/routes/sellerRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import couponRoutes from "./src/routes/couponRoutes.js";
import addressRoutes from "./src/routes/addressRoutes.js";
import rejectOrderRoutes from "./src/routes/rejectOrderRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
dotenv.config();

const port = process.env.PORT;
const app = express();
app.use(cookieParser());

app.use(express.json());

//seller Route
app.use("/api/sellers", sellerRoutes);

//product Route
app.use("/api/products", productRoutes);

//order Route
app.use("/api/orders", orderRoutes);

//user Route
app.use("/api/users", userRoutes);

//coupon Route
app.use("/api/coupons", couponRoutes);

//address Route
app.use("/api/addresses", addressRoutes);

//rejectOrder Route
app.use("/api/rejectOrders", rejectOrderRoutes);

//inventory Route
app.use("/api/inventory", inventoryRoutes);

//dashboard Route
app.use("/api/dashboard", dashboardRoutes);

//category Route
app.use("/api/category",categoryRoutes)

// Connect to Database
connectDB();

// Server Connection
app.listen(port, () => {
  console.log(`Server Start At Port http://localhost:${port}`);
});
