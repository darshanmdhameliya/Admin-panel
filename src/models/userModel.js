import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    mobileNo: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
    },
    resetOTP: {
      type: Number,
    },
    otpExpires: {
      type: Date,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("users", userSchema);