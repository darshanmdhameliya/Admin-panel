const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema({
    MobileNo: {
        type: Number
    },
    EmailId: {
        type: String,
    },
    setPassword: {
        type: String,
    },
    resetToken: {
        type: String
    },
    resetTokenExpire: {
        type: Date
    }

})


userSchema.methods.getJWT = async function () {
    const user = this;

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordhash = user.setPassword;

    const isPasswordValid = await bcrypt.compare(
        passwordInputByUser,
        passwordhash
    );

    return isPasswordValid;
};


module.exports = mongoose.model("register", userSchema)