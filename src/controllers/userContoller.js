import UserServices from "../services/userServices.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { ThrowError } from "../utils/ErrorUtils.js";

const userServices = new UserServices();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
}

// Register User
export const registerUser = async (req, res) => {
  try {
    const { email, password, mobileNo } = req.body;
    if (!email || !password || !mobileNo || email === "" || password === "" || mobileNo === "") {
      return res.status(400).json({ message: "Email, password, and mobileNo are required." });
    }

    // Check for existing email
    let userByEmail = await userServices.getUser({ email });
    if (userByEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Check for existing mobileNo
    let userByMobile = await userServices.getUser({ mobileNo });
    if (userByMobile) {
      return res.status(400).json({ message: "Mobile number already exists." });
    }

    const otp = generateOTP();
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user
    let user1;
    try {
      user1 = await userServices.addNewUser({
        email,
        password: hashPassword,
        mobileNo
      });
      // If addNewUser returns a string (error), handle it
      if (typeof user1 === "string") {
        return res.status(500).json({ message: user1 });
      }
    } catch (err) {
      // Handle duplicate key error gracefully (should not happen due to above checks, but just in case)
      if (err.code === 11000) {
        return res.status(400).json({ message: "Email or MobileNo already exists." });
      }
      throw err;
    }

    // Ensure user1 is a Mongoose document before setting properties
    if (typeof user1 !== "object" || !user1.save) {
      return res.status(500).json({ message: "Failed to create user." });
    }

    user1.resetOTP = Number(otp);
    user1.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user1.save();

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
      .json({ user: user1, message: "OTP sent successfully to your email." });

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

    const user = await userServices.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate OTP
    if (user.resetOTP !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.resetOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(201).json({ user, message: "New user added successfully." });

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
}

// Login User
export const loginUser = async (req, res) => {
  try {
    let user = await userServices.getUser({
      email: req.body.email,
      isDelete: false,
    });
    if (!user) {
      return res.status(400).json({
        message: ` Email Not Found..Please Check Your Email Address.`,
      });
    }
    let chekPassword = await bcrypt.compare(req.body.password, user.password);
    if (!chekPassword) {
      return res.status(401).json({
        message: ` Password is Not Match Please Enter Correct Password..`,
      });
    }
    let token = jwt.sign({ userId: user._id }, "User");
    res.status(200).json({ token, message: `Login SuccesFully..` });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { userId } = req.query;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required." });
    }
    let user = await userServices.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }
    if (newPassword === oldPassword) {
      return res
        .status(400)
        .json({ message: "New password can not be the same as old password." });
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await userServices.updateUser(userId, { password: hashPassword });

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

    const user = await userServices.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }

    // Ensure user is a valid Mongoose document
    if (!(user instanceof mongoose.Model)) {
      return res.status(500).json({ message: "Invalid user data" });
    }

    // Generate OTP
    const otp = generateOTP();
    user.resetOTP = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    await user.save(); // Save OTP in the database

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

    const user = await userServices.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate OTP
    if (user.resetOTP !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    await user.save();

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

    const user = await userServices.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }

    if (!(newPassword === confirmpassword)) {
      return res
        .status(400)
        .json({ message: "Please check newpassword and confirmpassword." });
    }

    // Hash new password
    await userServices.updateUser({ password: newPassword });
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    //  Generate a new JWT token
    // const token = jwt.sign(
    //   { userId: user._id, email: user.email, isAdmin: user.isAdmin },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "7d" }
    // );

    return res.status(200).json({
      message: "Password reset successfully.",
      user: { id: user._id, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};