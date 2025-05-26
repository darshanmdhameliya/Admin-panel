
import express from "express";
import { registerSeller, loginSeller, changePassword, forgotPassword, resetPassword, VerifyEmail, VerifyOtp, gstNo, VerifyGst, VerifyGstOtp, brandDetails, bankDetails, pickupAddress, putProfile, getSeller, getSellerById, editbankDetails, verifyBankOtp, deleteAccount, sellerLogout } from "../controllers/sellerController.js";
import sellerAuth from "../middlerware/auth.js";


const sellerRoutes = express.Router();

//sellerroutes post api
sellerRoutes.post("/registerSeller", registerSeller);
sellerRoutes.post("/verifyOtp", VerifyOtp);
sellerRoutes.post("/loginSeller", loginSeller);
sellerRoutes.post("/changePassword", sellerAuth, changePassword);
sellerRoutes.post("/forgotPassword", forgotPassword);
sellerRoutes.post("/verifyEmail", VerifyEmail);
sellerRoutes.post("/resetPassword", resetPassword);
sellerRoutes.post("/gstNo", sellerAuth, gstNo)
sellerRoutes.post("/verifyGst", sellerAuth, VerifyGst);
sellerRoutes.post("/verifyGstOtp", sellerAuth, VerifyGstOtp);
sellerRoutes.post("/brandDetails", sellerAuth, brandDetails);
sellerRoutes.post("/bankDetails", sellerAuth, bankDetails);
sellerRoutes.post("/pickupAddress", sellerAuth, pickupAddress);


//sellerroutes get api
sellerRoutes.put("/sellerData/:id", sellerAuth, putProfile);
sellerRoutes.get("/getsellerData", sellerAuth, getSeller);
sellerRoutes.get("/getsellerDataById/:id", sellerAuth, getSellerById);
sellerRoutes.put("/editbankDetails/:id", sellerAuth, editbankDetails);
sellerRoutes.post("/verifyBankOtp", sellerAuth, verifyBankOtp);
sellerRoutes.post("/deleteAccount/:id", sellerAuth, deleteAccount);
sellerRoutes.post("/logout", sellerLogout);


export default sellerRoutes;
