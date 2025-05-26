import mongoose from "mongoose";

const rejectSchema = mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
})
export default mongoose.model("RejectOrder", rejectSchema);