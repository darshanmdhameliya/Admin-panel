
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./src/config/db.js";
import cookieParser from "cookie-parser";
import sellerRoutes from "./src/routes/sellerRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
dotenv.config();

const port = process.env.PORT;
const app = express();
app.use(cookieParser());

// Middleware
app.use(express.json());

//seller Route
app.use("/api/sellers", sellerRoutes);

//product Route
app.use("/api/products", productRoutes);

//order Route
app.use("/api/orders", orderRoutes);

// Connect to Database
connectDB();

// Server Connection
app.listen(port, () => {
  console.log(`Server Start At Port http://localhost:${port}`);
});
