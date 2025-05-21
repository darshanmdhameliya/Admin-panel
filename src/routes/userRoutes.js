
import express from "express";
import { registerUser, loginUser, changePassword, forgotPassword, resetPassword, VerifyEmail, VerifyOtp } from "../controllers/userContoller.js";

const usersRoutes = express.Router();

usersRoutes.post("/registerUser", registerUser);
usersRoutes.post("/verifyOtp", VerifyOtp);
usersRoutes.post("/loginUser", loginUser);
usersRoutes.post("/changePassword", changePassword);
usersRoutes.post("/forgotPassword", forgotPassword);
usersRoutes.post("/verifyEmail", VerifyEmail);
usersRoutes.post("/resetPassword", resetPassword);

export default usersRoutes;
