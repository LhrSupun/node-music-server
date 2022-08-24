const express = require("express");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const User = require('../models/User');

const {
    getToken,
    verifyToken,
    encryptPassowrd,
} = require('../middleware/common-functions')

const router = express.Router();

router.post('/', async (req, res) => {
    try {

        let {
            email,
            firstName,
            lastName,
            password
        } = req.body;

        email = email.toLowerCase();

        const existsUser = await User.findOne({ email });
        if (existsUser) {
            return res.status(401).json("Email already exists!");
        }

        const verifyTokens = verifyToken();

        const newUser = new User({ firstName, lastName, email });

        newUser.password = await encryptPassowrd(password);
        newUser.verificationToken = verifyTokens.verificationToken;
        newUser.verificationTokenTimeStamp = verifyTokens.verificationTokenTimeStamp;

        await newUser.save();
        return res.status(200).json({
            message: "User Created Successfully"
        })
    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});


router.get('/', async (req, res) => {
    try {
        return res.status(200).json({
            message: "it's working"
        });
    } catch (error) {
        return res.status(500).json("500 Internal Server Error");
    }
})

module.exports = router;