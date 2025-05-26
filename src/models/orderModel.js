import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'addresses'
  },
  product: {
    type: Array
  },
  subTotal: {
    type: String
  },
  discount: {
    type: String
  },
  tax: {
    type: String
  },
  deliveryCharge: {
    type: String
  },
  totalAmount: {
    type: String
  },
  paymentStatus: {
    type: String,
  },
  paymentMethod: {
    type: String,
    enum: ["Debit / Credit Card", "Net Banking", "Paypal"]
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  card_HolderName: {
    type: String
  },
  card_Number: {
    type: Number
  },
  orderStatus: {
    type: String,
    enum: ["accepted", "rejected"],
  }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.model("Order", orderSchema);
