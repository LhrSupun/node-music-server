const express = require("express");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const User = require('../models/User');

const auth = require('../middleware/auth');

const {
    getToken,
    verifyToken,
    encryptPassowrd,
    comparePassword,
} = require('../middleware/common-functions')

const router = express.Router();

router.post('/', async (req, res) => {
    try {

        let {
            email,
            firstName,
            lastName,
            password,
        } = req.body;

        email = email.toLowerCase();

        const existsUser = await User.findOne({ email });
        if (existsUser) {
            return res.status(401).json({ message: "Email already exists!" });
        }

        const verifyTokens = verifyToken();

        const newUser = new User({ firstName, lastName, email });

        newUser.password = await encryptPassowrd(password);
        newUser.verificationToken = verifyTokens.verificationToken; // hmm
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

router.post('/login', async (req, res) => {
    try {
        let {
            email,
            password,
        } = req.body;

        email = email.toLowerCase();

        const existsUser = await User.findOne({ email });
        if (!existsUser) {
            return res.status(401).json({ message: "User Does not Exists!" });
        }

        const passwordCheck = await comparePassword(password, existsUser.password)

        if (passwordCheck) {
            return res.status(401).json({ message: "Please check your password" });
        }

        const tokenData = {
            userId: existsUser.id,
            email: existsUser.email,
            role: existsUser.role,
        }

        const accessToken = getToken(tokenData, process.env.JWT_KEY, "2h");

        return res.status(200).json({
            accessToken,
            message: "Login Successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json("500 Internal Server Error");
    }
});

router.post('/register', auth, async (req, res) => {
    try {

        let {
            email,
            firstName,
            lastName,
            password,
            role,
        } = req.body;

        if (req.user.role !== "admin" && role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        email = email.toLowerCase();
        const existsUser = await User.findOne({ email });
        if (existsUser) {
            return res.status(401).json({ message: "Email already exists!" });
        }

        const verifyTokens = verifyToken();

        const newUser = new User({ firstName, lastName, email, role });

        newUser.password = await encryptPassowrd(password);
        newUser.verificationToken = verifyTokens.verificationToken; // hmm
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


router.put('/change-password', auth, async (req, res) => {
    try {
        const {
            oldPassword,
            newPassword,
        } = req.body;

        if (oldPassword === newPassword) {
            return res.status(401).json({ message: "Password cannot be the same!" });
        }

        const user = await User.findById(ObjectId(req.user.userId));

        const passwordCheck = await comparePassword(oldPassword, user.password)

        if (passwordCheck) {
            return res.status(401).json({ message: "Please check your old password" });
        }

        const password = await encryptPassowrd(newPassword);

        // await User.findByIdAndUpdate(user.id, { password });

        return res.status(200).json({
            message: "Password Changed successfully"
        });
    } catch (error) {
        console.log(error);
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