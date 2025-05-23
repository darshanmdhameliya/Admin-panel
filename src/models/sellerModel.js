import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const sellerSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    mobileNo: {
      type: String,
      unique: true
    },
    email: {
      type: String,
      unique: true
    },
    password: {
      type: String,
    },
    resetOTP: {
      type: Number,
    },
    otpExpires: {
      type: Date,
    },
    gstNo: {
      type: String,
      unique: true
    },
    gstType: {
      type: String
    },
    panNumber: {
      type: String,
    },
    gstOtp: {
      type: String,
      unique: true
    },
    storeName: {
      type: String,
    },
    ownerName: {
      type: String,
    },
    beneficiaryName: {
      type: String,
    },
    bankName: {
      type: String,
    },
    accountNo: {
      type: Number,
    },
    IFSCcode: {
      type: String,
    },
    bankOtp: {
      type: Number,
    },
    R_F_B_Number: {
      type: String,
    },
    Street: {
      type: String,
    },
    Landmark: {
      type: String,
    },
    Pincode: {
      type: Number,
    },
    City: {
      type: String,
    },
    State: {
      type: String,
    },

    isDelete: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


export default mongoose.model("sellers", sellerSchema);