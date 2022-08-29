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
    validateInput,
} = require('../middleware/common-functions')

const {
    UserSchema,
    LoginSchema,
    ChangePasswordSchema,
} = require('../validations/Users')
const router = express.Router();


// @route POST api/user/
// @desc create new user
// @access Public
router.post('/', async (req, res) => {
    try {

        const validUser = validateInput(UserSchema, req.body);
        if (!validUser.value) {
            return res.status(403).json(validUser);
        }
        const {
            email,
            firstName,
            lastName,
            password,
        } = validUser.value;

        const existsUser = await User.findOne({ email }).collation({ locale: 'en', strength: 2 });
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


// @route POST api/user/login
// @desc login user
// @access Public
router.post('/login', async (req, res) => {
    try {

        const validUser = validateInput(LoginSchema, req.body);
        if (!validUser.value) {
            return res.status(403).json(validUser);
        }

        const {
            email,
            password,
        } = validUser.value;

        const existsUser = await User.findOne({ email }).collation({ locale: 'en', strength: 2 });
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


// @route POST api/user/register
// @desc create new Admin
// @access Private
router.post('/register', auth, async (req, res) => {
    try {
        if (req.user.role !== "admin" && role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });

        }

        const validUser = validateInput(UserSchema, req.body);
        if (!validUser.value) {
            return res.status(403).json(validUser);
        }
        const {
            email,
            firstName,
            lastName,
            password,
            role,
        } = validUser.value;

        const existsUser = await User.findOne({ email }).collation({ locale: 'en', strength: 2 });
        if (existsUser) {
            return res.status(401).json({ message: "Email already exists!" });
        }

        // const verifyTokens = verifyToken();

        const newUser = new User({ firstName, lastName, email, role });

        newUser.password = await encryptPassowrd(password);
        // newUser.verificationToken = verifyTokens.verificationToken; // hmm
        // newUser.verificationTokenTimeStamp = verifyTokens.verificationTokenTimeStamp;

        await newUser.save();
        return res.status(200).json({
            message: "User Created Successfully"
        })
    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
});


// @route PUT api/user/change-password
// @desc create new user
// @access Private
router.put('/change-password', auth, async (req, res) => {
    try {

        const validUser = validateInput(ChangePasswordSchema, req.body);
        if (!validUser.value) {
            return res.status(403).json(validUser);
        }
        const {
            oldPassword,
            newPassword,
        } = validUser.value;

        if (oldPassword === newPassword) {
            return res.status(401).json({ message: "Password cannot be the same!" });
        }

        const user = await User.findById(ObjectId(req.user.userId));

        const passwordCheck = await comparePassword(oldPassword, user.password)

        if (passwordCheck) {
            return res.status(401).json({ message: "Please check your old password" });
        }

        const password = await encryptPassowrd(newPassword);

        await User.findByIdAndUpdate(user._id, { password });

        return res.status(200).json({
            message: "Password Changed successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json("500 Internal Server Error");
    }
});

// @route GET api/user/:id
// @desc get user by id
// @access Private
router.get('/:id', auth, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                message: "invalid User Id"
            });
        }
        const user = await User.findById(ObjectId(req.params.id)).select("_id role email firstName lastName fullName");
        return res.status(200).json({
            user
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
})

// @route DELETE api/user/:id
// @desc delete user by id admin access
// @access Private 
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                message: "invalid User Id"
            });
        }
        const _id = ObjectId(req.params.id);
        const ifExists = await User.findById({ _id });
        if (!ifExists) {
            return res.status(401).json({ message: `user does not exists!` });
        }

        await User.findByIdAndDelete(_id);
        return res.status(200).json({
            message: "User deleted Successfully!"
        });

    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
})

// @route GET api/user/
// @desc get all users
// @access Private
router.get('/', auth, async (req, res) => {
    try {
        let data = null;
        if (req.user.role === "admin") {
            data = await User.find({}).select("_id role email firstName lastName fullName");
        } else if (req.user.role === "user") {
            data = await User.findById(ObjectId(req.user.userId)).select("_id role email firstName lastName fullName");
        }
        return res.status(200).json(data);
    } catch (error) {
        console.log({ error });
        return res.status(500).json("500 Internal Server Error");
    }
})

module.exports = router;