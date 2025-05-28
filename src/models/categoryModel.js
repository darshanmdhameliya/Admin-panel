import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    categoryImage: {
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("Category", categorySchema);