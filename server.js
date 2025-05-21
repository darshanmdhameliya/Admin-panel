
import dotenv from "dotenv";
import express from "express";
import userRoute from "./src/routes/indexRoutes.js";
import { connectDB } from "./src/config/db.js";

dotenv.config();

const port = process.env.PORT;
const app = express();

// Middleware
app.use(express.json());

// User Route
app.use("/api/user", userRoute);

// Connect to Database
connectDB();

// Server Connection
app.listen(port, () => {
  console.log(`Server Start At Port http://localhost:${port}`);
});
