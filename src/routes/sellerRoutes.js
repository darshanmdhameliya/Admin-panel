
import express from "express";
import { registerSeller, loginSeller, changePassword, forgotPassword, resetPassword, VerifyEmail, VerifyOtp, gstNo, VerifyGst, VerifyGstOtp, brandDetails, bankDetails, pickupAddress, putProfile, getSeller, getSellerById, editbankDetails } from "../controllers/sellerContoller.js";

const sellersRoutes = express.Router();

//sellerroutes post api
sellersRoutes.post("/registerSeller", registerSeller);
sellersRoutes.post("/verifyOtp", VerifyOtp);
sellersRoutes.post("/loginSeller", loginSeller);
sellersRoutes.post("/changePassword", changePassword);
sellersRoutes.post("/forgotPassword", forgotPassword);
sellersRoutes.post("/verifyEmail", VerifyEmail);
sellersRoutes.post("/resetPassword", resetPassword);
sellersRoutes.post("/gstNo", gstNo)
sellersRoutes.post("/verifyGst", VerifyGst);
sellersRoutes.post("/verifyGstOtp", VerifyGstOtp);
sellersRoutes.post("/brandDetails", brandDetails);
sellersRoutes.post("/bankDetails", bankDetails);
sellersRoutes.post("/pickupAddress", pickupAddress);


//sellerroutes get api
sellersRoutes.put("/sellerData/:id", putProfile);
sellersRoutes.get("/getsellerData", getSeller);
sellersRoutes.get("/getsellerDataById/:id", getSellerById);
sellersRoutes.put("/editbankDetails/:id", editbankDetails);


export default sellersRoutes;
