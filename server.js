
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./src/config/db.js";
import sellerRoute from "./src/routes/indexRoutes.js";



dotenv.config();

const port = process.env.PORT;
const app = express();

// Middleware
app.use(express.json());

// User Route
app.use("/api/seller", sellerRoute);


// Connect to Database
connectDB();

// Server Connection
app.listen(port, () => {
  console.log(`Server Start At Port http://localhost:${port}`);
});
