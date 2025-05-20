const express = require("express");
const { userAuth } = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/register.model');
const jwt = require("jsonwebtoken")

const profileRouter = express.Router();

//viewprofile = http://localhost:3000/profile/view
profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (error) {
        res.status(400).send("ERROR: " + error.message);
    }
});


//forgotpassword = http://localhost:3000/profile/password
// profileRouter.patch("/profile/password", userAuth, async (req, res) => {
//     try {
//         const loginUser = req.user;
//         const { setPassword } = req.body;

//         const passwordHash = await bcrypt.hash(setPassword, 10);
//         loginUser.setPassword = passwordHash;

//         await loginUser.save();

//         res.json("Password Updated Successfully...✅");
//     } catch (error) {
//         res.status(400).send("ERROR: " + error.message);
//     }
// });

profileRouter.post('/forgot-password', async (req, res) => {
    const { EmailId } = req.body;
    const user = await User.findOne({ EmailId });
    if (!user) return res.status(400).send('User not found');

    // Create JWT token valid for 1 hour
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const otp = Math.floor(100000 + Math.random() * 900000);
    const mailOptions = {
        to: user.EmailId,
        subject: 'Password Reset',
        html: `<p>your otp is here ${otp}</p>`
    };

    await transporter.sendMail(mailOptions);

    res.send('Password reset link sent to your email.');
});



// GET /reset-password/:token
profileRouter.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        const user = await User.findById(decoded.id);
   
        if (!user) return res.status(400).send('Invalid token or user not found');

        res.send('Valid token. Show reset password form.');
    } catch (error) {
        res.status(400).send('Invalid or expired token');
    }
});


// POST /reset-password/:token
profileRouter.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { setPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(400).send('Invalid or expired token');

        user.setPassword = await bcrypt.hash(setPassword, 10);
        await user.save();

        res.send('Password has been reset successfully ✅');
    } catch (error) {
        res.status(400).send('Token expired or invalid');
    }
});


module.exports = profileRouter;
