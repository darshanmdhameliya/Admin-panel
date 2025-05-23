import jwt from "jsonwebtoken";
import sellerModel from "../models/sellerModel.js";

const sellerAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new Error("Token is not valid!!!");
        }

        const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);

        const { _id } = decodedObj;

        const seller = await sellerModel.findById(_id);

        if (!seller) {
            throw new Error("Seller not Found!!!");
        }

        req.seller = seller;
        next();
    } catch (error) {
        res.status(400).send("ERROR: " + error.message);
    }
};

export default sellerAuth;