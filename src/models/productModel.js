import mongoose from "mongoose";

const productSchema = mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        },
        product_name: {
            type: String,
        },
        price: {
            type: Number,
            default: 0.0,
        },
        discount: {
            type: Number,
            default: 0.0,
        },
        productimage: {
            type: Array
        },
        unit: [{
            type: String,
            default: ["KG", "Gram", "Piece"],
        }],
        product_description: {
            type: String,
        },
        quantity: {
            type: Number,
            default: 0,
        },
        tittle: {
            type: String,
        },
        description: {
            type: String,
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
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }

);

export default mongoose.model("Product", productSchema);