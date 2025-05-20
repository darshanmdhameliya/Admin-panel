const express = require("express");
const bcrypt = require("bcrypt");
const { validateSignupData } = require("../utils/validation");
const Register = require("../models/register.model")

const authRouter = express.Router();

//register = http://localhost:3000/register
authRouter.post("/register", async (req, res) => {
    try {
        validateSignupData(req);

        const { MobileNo, EmailId, setPassword } = req.body;
        const passwordhash = await bcrypt.hash(setPassword, 10);

        const user = new Register({
            MobileNo,
            EmailId,
            setPassword: passwordhash,
        });

        await user.save();

        res.send("User add Successfully....✅" + user);
    } catch (error) {
        res.status(400).send("ERROR: " + error.message);
    }
});

//login = http://localhost:3000/login
authRouter.post("/login", async (req, res) => {
    try {
        const { EmailId, setPassword } = req.body;

        const user = await Register.findOne({ EmailId: EmailId });
        if (!user) {
            throw new Error("emailId not present at DB!!!!");
        }

        const isPassword = await user.validatePassword(setPassword);
        if (isPassword) {
            const token = await user.getJWT();

            if (!token) {
                throw new Error("token not valid!!!");
            }

            res.cookie("token", token, {
                expires: new Date(Date.now() + 8 * 3600000),
            });

            res.send(user);
        } else {
            throw new Error("Password not valid!!!");
        }
    } catch (error) {
        res.status(400).send("ERROR: " + error.message);
    }
});

//logout = http://localhost:3000/logout
authRouter.post("/logout", async (req, res) => {
    try {
        res.cookie("token", null, { expires: new Date(Date.now()) });
        res.send("User logout successfully...✅");
    } catch (error) {
        res.status(500).send("ERROR: " + error.message)
    }
})

module.exports = authRouter;