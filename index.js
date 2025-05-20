const mongoose = require("mongoose")
const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser");
require('dotenv').config();

NODE_TLS_REJECT_UNAUTHORIZED = 0

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cookieParser());

const authRouter = require("./router/auth")
const profileRouter = require("./router/profile")

app.use("/", authRouter)
app.use("/", profileRouter)


mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("DB connected successfully..✅");
}).catch((error) => {
    console.log(error);
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port number http://localhost:${process.env.PORT}`);
})