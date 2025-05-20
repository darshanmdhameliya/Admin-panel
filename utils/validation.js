const validator = require("validator");

const validateSignupData = (req) => {
    const { MobileNo, EmailId, setPassword } = req.body;

    if (!MobileNo) {
        throw new Error("MobileNo is not valid!!!");
    } else if (!validator.isEmail(EmailId)) {
        throw new Error("EmialId is not valid!!!");
    } else if (!validator.isStrongPassword(setPassword)) {
        throw new Error("Please enter a strong passowrd!!");
    }
};

module.exports = {
    validateSignupData,
};