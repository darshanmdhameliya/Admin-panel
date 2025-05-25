import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  OrderId: {
    type: String,
  },
  Custoemr_name: {
    type: String,
  },
  Date_Time: {
    type: Date,
  },
  Payment: {
    type: String,
  },
  Amount: {
    type: Number,
  },
  Payment_Status: {
    type: String,
  },
  Order_Status: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});


export default mongoose.model("Order", orderSchema);    