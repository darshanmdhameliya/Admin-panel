import SellerServices from "../services/sellerServices.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import sellerModel from "../models/sellerModel.js";
import { ThrowError } from "../utils/ErrorUtils.js";

const sellerServices = new SellerServices();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
}

// Register seller
export const registerSeller = async (req, res) => {
  try {
    const { email, password, mobileNo } = req.body;
    if (!email || !password || !mobileNo || email === "" || password === "" || mobileNo === "") {
      return res.status(400).json({ message: "Email, password, and mobileNo are required." });
    }

    // Check for existing email
    let sellerByEmail = await sellerServices.getSeller({ email });
    if (sellerByEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Check for existing mobileNo
    let sellerByMobile = await sellerServices.getSeller({ mobileNo });
    if (sellerByMobile) {
      return res.status(400).json({ message: "Mobile number already exists." });
    }

    const otp = generateOTP();
    const hashPassword = await bcrypt.hash(password, 10);

    // Create seller
    let seller1;
    try {
      seller1 = await sellerServices.addNewSeller({
        email,
        password: hashPassword,
        mobileNo
      });
      // If addNewseller returns a string (error), handle it
      if (typeof seller1 === "string") {
        return res.status(500).json({ message: seller1 });
      }
    } catch (err) {
      // Handle duplicate key error gracefully (should not happen due to above checks, but just in case)
      if (err.code === 11000) {
        return res.status(400).json({ message: "Email or MobileNo already exists." });
      }
      throw err;
    }

    // Ensure seller1 is a Mongoose document before setting properties
    if (typeof seller1 !== "object" || !seller1.save) {
      return res.status(500).json({ message: "Failed to create seller." });
    }

    seller1.resetOTP = Number(otp);
    seller1.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await seller1.save();

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.MY_GMAIL,
      to: email,
      subject: "Register OTP",
      text: `Your OTP for register is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ seller: seller1, message: "OTP sent successfully to your email." });

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

//VerifyOtp
export const VerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Please provide Email and OTP." });
    }

    const seller = await sellerServices.getSellerByEmail(email);
    if (!seller) {
      return res.status(404).json({ message: "seller not found." });
    }

    // Validate OTP
    if (seller.resetOTP !== otp || seller.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    seller.resetOTP = undefined;
    seller.otpExpires = undefined;
    await seller.save();

    return res.status(201).json({ seller, message: "New seller added successfully." });

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
}

// Login seller
export const loginSeller = async (req, res) => {
  try {
    let seller = await sellerServices.getSeller({
      email: req.body.email,
    });
    if (!seller) {
      return res.status(400).json({
        message: ` Email Not Found..Please Check Your Email Address.`,
      });
    }
    let chekPassword = await bcrypt.compare(req.body.password, seller.password);
    if (!chekPassword) {
      return res.status(401).json({
        message: ` Password is Not Match Please Enter Correct Password..`,
      });
    }
    // let token = await seller.getJWT();
    // res.cookie("token", token, {
    //   expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    //   httpOnly: true,
    // });

    let token = await jwt.sign({_id: seller._id}, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    res.status(200).json({ token, message: `Login SuccesFully..` });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { sellerId } = req.query;
    const { currentPassword, newPassword, retypePassword } = req.body;
    if (!currentPassword || !newPassword || !retypePassword) {
      return res
        .status(400)
        .json({ message: "currentPassword , newPassword and currentPassword are required." });
    }
    let seller = await sellerServices.getSellerById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "seller not found." });
    }
    const isMatch = await bcrypt.compare(currentPassword, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "currentPassword is incorrect." });
    }
    if (newPassword === currentPassword) {
      return res
        .status(400)
        .json({ message: "Newpassword can not be the same as currentPassword." });
    }

    if (newPassword !== retypePassword) {
      return res
        .status(400)
        .json({ message: "Newpassword and retypePassword do not match." });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    await sellerServices.updateSeller(sellerId, { password: hashPassword });

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

// Forgot Password (Send OTP)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Provide Email Id" });
    }

    const seller = await sellerServices.getSellerByEmail(email);
    if (!seller) {
      return res.status(400).json({ message: "seller Not Found" });
    }

    // Ensure seller is a valid Mongoose document
    if (!(seller instanceof mongoose.Model)) {
      return res.status(500).json({ message: "Invalid seller data" });
    }

    // Generate OTP
    const otp = generateOTP();
    seller.resetOTP = otp;
    seller.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    await seller.save(); // Save OTP in the database

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.MY_GMAIL,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "OTP sent successfully to your email." });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

//Verify Email
export const VerifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Please provide Emal and OTP." });
    }

    const seller = await sellerServices.getSellerByEmail(email);
    if (!seller) {
      return res.status(404).json({ message: "seller not found." });
    }

    // Validate OTP
    if (seller.resetOTP !== otp || seller.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    await seller.save();

    return res.status(200).json({
      message: "OTP Submited."
    });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
}

// Reset Password using OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmpassword } = req.body;
    if (!newPassword || !confirmpassword) {
      return res
        .status(400)
        .json({ message: "Please provide email,newpassword and confirmpassword." });
    }

    const seller = await sellerServices.getSellerByEmail(email);
    if (!seller) {
      return res.status(400).json({ message: "seller Not Found" });
    }

    if (!(newPassword === confirmpassword)) {
      return res
        .status(400)
        .json({ message: "Please check newpassword and confirmpassword." });
    }

    // Hash new password
    await sellerServices.updateSeller({ password: newPassword });
    seller.password = await bcrypt.hash(newPassword, 10);
    seller.resetOTP = undefined;
    seller.otpExpires = undefined;
    await seller.save();

    //  Generate a new JWT token
    // const token = jwt.sign(
    //   { sellerId: seller._id, email: seller.email, isAdmin: seller.isAdmin },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "7d" }
    // );

    return res.status(200).json({
      message: "Password reset successfully.",
      seller: { id: seller._id, email: seller.email, isAdmin: seller.isAdmin },
    });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

// GSTNo
export const gstNo = async (req, res) => {
  try {
    const { _id } = req.body;

    if (_id === undefined || _id === "") {
      return res.status(400).json({ message: "Seller ID is required." });
    }
    // Check if the seller exists
    const seller = await sellerServices.getSellerById(_id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }

    const gstNo = req.body.gstNo;
    if (!gstNo || gstNo === "") {
      return res.status(400).json({ message: "GST Number is required." });
    }
    // Check if the seller is already registered with a GST Number
    if (seller.gstNo) {
      return res.status(400).json({ message: "GST Number already exists." });
    }

    // Update the seller's GST Number
    const updatedSeller = await sellerModel.findByIdAndUpdate(
      _id,
      { gstNo },
      { new: true }
    );
    // If addNewseller returns a string (error), handle it
    if (typeof updatedSeller === "string") {
      return res.status(500).json({ message: updatedSeller });
    }
    // Ensure updatedSeller is a Mongoose document before setting properties
    if (typeof updatedSeller !== "object" || !updatedSeller.save) {
      return res.status(500).json({ message: "Failed to create GST." });
    }
    updatedSeller.gstNo = gstNo;
    await updatedSeller.save();
    return res.status(200).json({
      message: "GST Number added successfully.",
      seller: { id: updatedSeller._id, email: updatedSeller.email, gstNo: updatedSeller.gstNo },
    });

  }
  catch (error) {
    return ThrowError(res, 500, error.message);
  }
}

//VerifyGst
export const VerifyGst = async (req, res) => {
  try {
    const { email, gstNo } = req.body;

    if (!email || !gstNo || email === "" || gstNo === "") {
      return res
        .status(400)
        .json({ message: "Please provide Email and gstNo." });
    }

    const seller = await sellerServices.getSellerByEmail(email);
    if (!seller) {
      return res.status(404).json({ message: "seller not found." });
    }

    //verfiygstNo
    const gst = await sellerServices.getGst({ gstNo });
    if (!gst) {
      return res.status(404).json({ message: "GST Number not found." });
    }

    //Generate OTP
    const otp = generateOTP();
    seller.gstOtp = otp;
    seller.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    await seller.save(); // Save OTP in the database

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.MY_GMAIL,
      to: email,
      subject: "Gst Number verify OTP",
      text: `Your OTP for Gst Number verify is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "OTP sent successfully to your email." });

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
}

// VerfiyGstOtp
export const VerifyGstOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp || email === "" || otp === "") {
      return res
        .status(400)
        .json({ message: "Please provide Email and OTP." });
    }

    const seller = await sellerServices.getSellerByEmail(email);
    if (!seller) {
      return res.status(404).json({ message: "seller not found." });
    }

    // Validate OTP
    if (seller.gstOtp !== otp || seller.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    seller.gstOtp = undefined;
    seller.otpExpires = undefined;
    await seller.save();

    return res.status(200).json({ message: "GST Number verified successfully." });

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
}

// Brand Details
export const brandDetails = async (req, res) => {
  try {
    const { _id } = req.body;
    if (_id === undefined || _id === "") {
      return res.status(400).json({ message: "Seller ID is required." });
    }
    // Check if the seller exists
    const seller = await sellerServices.getSellerById(_id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }
    const { storeName, ownerName } = req.body;
    if (!storeName || storeName === "") {
      return res.status(400).json({ message: "Store Name is required." });
    }
    if (!ownerName || ownerName === "") {
      return res.status(400).json({ message: "Owner Name is required." });
    }
    // Check if the seller is already registered with a Store Name
    if (seller.storeName) {
      return res.status(400).json({ message: "Store Name already exists." });
    }
    // Check if the seller is already registered with a Owner Name
    if (seller.ownerName) {
      return res.status(400).json({ message: "Owner Name already exists." });
    }
    // Update the seller's Store Name
    const updatedSeller = await sellerModel.findByIdAndUpdate(
      _id,
      { storeName, ownerName },
      { new: true }
    );
    // If addNewseller returns a string (error), handle it
    if (typeof updatedSeller === "string") {
      return res.status(500).json({ message: updatedSeller });
    }
    // Ensure updatedSeller is a Mongoose document before setting properties
    if (typeof updatedSeller !== "object" || !updatedSeller.save) {
      return res.status(500).json({ message: "Failed to create Store Name." });
    }
    updatedSeller.storeName = storeName;
    updatedSeller.ownerName = ownerName;
    await updatedSeller.save();
    return res.status(200).json({
      message: "Store Name added successfully.",
      seller: { id: updatedSeller._id, email: updatedSeller.email, storeName: updatedSeller.storeName },
    });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
}

//bankDetails
export const bankDetails = async (req, res) => {
  try {
    const { _id } = req.body;
    if (_id === undefined || _id === "") {
      return res.status(400).json({ message: "Seller ID is required." });
    }
    // Check if the seller exists
    const seller = await sellerServices.getSellerById(_id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }
    const { bankName, accountNo, IFSCcode } = req.body;
    if (!bankName || bankName === "") {
      return res.status(400).json({ message: "Bank Name is required." });
    }
    if (!accountNo || accountNo === "") {
      return res.status(400).json({ message: "Account Number is required." });
    }
    if (!IFSCcode || IFSCcode === "") {
      return res.status(400).json({ message: "IFSC Code is required." });
    }
    // Check if the seller is already registered with a Bank Name
    if (seller.bankName) {
      return res.status(400).json({ message: "Bank Name already exists." });
    }
    // Check if the seller is already registered with a Account Number
    if (seller.accountNo) {
      return res.status(400).json({ message: "Account Number already exists." });
    }
    // Check if the seller is already registered with a IFSC Code
    if (seller.IFSCcode) {
      return res.status(400).json({ message: "IFSC Code already exists." });
    }
    // Update the seller's Bank Name
    const updatedSeller = await sellerModel.findByIdAndUpdate(
      _id,
      { bankName, accountNo, IFSCcode },
      { new: true }
    );
    // If addNewseller returns a string (error), handle it
    if (typeof updatedSeller === "string") {
      return res.status(500).json({ message: updatedSeller });
    }
    // Ensure updatedSeller is a Mongoose document before setting properties
    if (typeof updatedSeller !== "object" || !updatedSeller.save) {
      return res.status(500).json({ message: "Failed to create Bank Name." });
    }
    updatedSeller.bankName = bankName;
    updatedSeller.accountNo = accountNo;
    updatedSeller.IFSCcode = IFSCcode;
    await updatedSeller.save();
    return res.status(200).json({
      message: "Bank Name added successfully.",
      seller: { id: updatedSeller._id, email: updatedSeller.email, bankName: updatedSeller.bankName },
    });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
}

//pickupAddress
export const pickupAddress = async (req, res) => {
  try {
    const { _id } = req.body;
    if (_id === undefined || _id === "") {
      return res.status(400).json({ message: "Seller ID is required." });
    }
    // Check if the seller exists
    const seller = await sellerServices.getSellerById(_id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }
    const { R_F_B_Number, Street, Landmark, Pincode, City, State } = req.body;
    if (!R_F_B_Number || R_F_B_Number === "") {
      return res.status(400).json({ message: "R_F_B_Number is required." });
    }
    if (!Street || Street === "") {
      return res.status(400).json({ message: "Street is required." });
    }
    if (!Landmark || Landmark === "") {
      return res.status(400).json({ message: "Landmark is required." });
    }
    if (!Pincode || Pincode === "") {
      return res.status(400).json({ message: "Pincode is required." });
    }
    if (!City || City === "") {
      return res.status(400).json({ message: "City is required." });
    }
    if (!State || State === "") {
      return res.status(400).json({ message: "State is required." });
    }
    // Check if the seller is already registered with a R_F_B_Number
    if (seller.R_F_B_Number) {
      return res.status(400).json({ message: "R_F_B_Number already exists." });
    }
    // Check if the seller is already registered with a Street
    if (seller.Street) {
      return res.status(400).json({ message: "Street already exists." });
    }
    // Check if the seller is already registered with a Landmark
    if (seller.Landmark) {
      return res.status(400).json({ message: "Landmark already exists." });
    }
    // Check if the seller is already registered with a Pincode
    if (seller.Pincode) {
      return res.status(400).json({ message: "Pincode already exists." });
    }
    // Check if the seller is already registered with a City
    if (seller.City) {
      return res.status(400).json({ message: "City already exists." });
    }
    // Check if the seller is already registered with a State
    if (seller.State) {
      return res.status(400).json({ message: "State already exists." });
    }
    // Update the seller's pickup address
    const updatedSeller = await sellerModel.findByIdAndUpdate(
      _id,
      { R_F_B_Number, Street, Landmark, Pincode, City, State },
      { new: true }
    );
    // If addNewseller returns a string (error), handle it
    if (typeof updatedSeller === "string") {
      return res.status(500).json({ message: updatedSeller });
    }
    // Ensure updatedSeller is a Mongoose document before setting properties
    if (typeof updatedSeller !== "object" || !updatedSeller.save) {
      return res.status(500).json({ message: "Failed to create pickup address." });
    }
    updatedSeller.R_F_B_Number = R_F_B_Number;
    updatedSeller.Street = Street;
    updatedSeller.Landmark = Landmark;
    updatedSeller.Pincode = Pincode;
    updatedSeller.City = City;
    updatedSeller.State = State;
    await updatedSeller.save();
    return res.status(200).json({
      message: "Pickup address added successfully.",
      seller: { id: updatedSeller._id, email: updatedSeller.email, R_F_B_Number: updatedSeller.R_F_B_Number, Street: updatedSeller.Street, Landmark: updatedSeller.Landmark, Pincode: updatedSeller.Pincode, City: updatedSeller.City, State: updatedSeller.State },
    });

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
}

//putProfle
export const putProfile = async (req, res) => {
  try {
    const _id = req.params.id;
    const sellerData = await sellerModel.findByIdAndUpdate(_id, { ...req.body }, { new: true });
    if (!sellerData) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(200).json(sellerData);
  } catch (error) {

    return ThrowError(res, 500, error.message);
  }
};

//getSeller
export const getSeller = async (req, res) => {
  var sellerData = await sellerModel.find();
  if (!sellerData) {
    return res.status(404).json({ message: "Seller not found" });
  }
  res.status(200).json(sellerData);
}

//getSellerById
export const getSellerById = async (req, res) => {
  var id = req.params.id;
  var sellerData = await sellerModel.findById(id);
  if (!sellerData) {
    return res.status(404).json({ message: "Seller not found" });
  }
  res.status(200).json(sellerData);
}

//editbankDetails
export const editbankDetails = async (req, res) => {
  const { mobileNo, email } = req.body;
  const id = req.params.id;

  if (!mobileNo || !email || mobileNo === "" || email === "") {
    return res.status(400).json({ message: "Mobile number and email are required." });
  }

  const seller = await sellerServices.getSellerById(id);
  if (!seller) {
    return res.status(404).json({ message: "Seller not found." });
  }

  if (seller.mobileNo !== mobileNo) {
    return res.status(400).json({ message: "Mobile number is wrong!!." });
  }

  if (seller.email !== email) {
    return res.status(400).json({ message: "Email is wrong!!." });
  }

  // OTP generation
  const otp = generateOTP();
  seller.bankOtp = otp;
  seller.otpExpires = Date.now() + 10 * 60 * 1000;

  await seller.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MY_GMAIL,
      pass: process.env.MY_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.MY_GMAIL,
    to: email,
    subject: "Bank details OTP",
    text: `Your OTP for Bank details is: ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);

  return res.status(200).json({
    message: "OTP sent successfully to your email.",
    seller: {
      id: seller._id,
      email: seller.email,
      mobileNo: seller.mobileNo,
      otp: seller.bankOtp,
    },
  });
};


//verifyBankOtp
export const verifyBankOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp || email === "" || otp === "") {
      return res
        .status(400)
        .json({ message: "Please provide Email and OTP." });
    }

    const seller = await sellerServices.getSellerByEmail(email);
    if (!seller) {
      return res.status(404).json({ message: "seller not found." });
    }

    // Validate OTP
    if (seller.bankOtp !== otp || seller.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    seller.bankOtp = undefined;
    seller.otpExpires = undefined;
    await seller.save();

    return res.status(200).json({ message: "Bank details verified successfully." });

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
}

//deleteaccount
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Seller ID is required." });
    }
    // Check if the seller exists
    const seller = await sellerServices.getSellerById(id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }
    //passwod check
    const { password } = req.body;
    if (!password || password === "") {
      return res.status(400).json({ message: "Password is required." });
    }
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect." });
    }

    // Soft delete the seller
    await sellerServices.updateSeller(id, { isDelete: true });
    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
}


//logout
export const logout = async (req, res) => {
  try {
    res.cookie("token", null, { expires: new Date(Date.now()) });

    return res.status(400).json({ message: "User logout successfully...✅" });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};