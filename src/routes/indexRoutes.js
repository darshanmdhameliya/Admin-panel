
import express from "express";
import usersRoutes from "../routes/userRoutes.js";

const userRoute = express.Router();

//User Route
userRoute.use("/users", usersRoutes);

export default userRoute;
