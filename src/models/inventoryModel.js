import mongoose from "mongoose";

const inventorySchema = mongoose.Schema({
    category: {
        type: String,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    quantity: {
        type: Number,
        min: 0
    },
    Low_stock_limit: {
        type: Number,
        min: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },

}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("Inventory", inventorySchema);