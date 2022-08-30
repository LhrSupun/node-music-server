const express = require("express");
const User = require('../models/User');
const {
    encryptPassowrd
} = require('../middleware/common-functions')

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const email = "lhrsupun+newadmin@gmail.com";
        const [existsUser, password] = await Promise.all([
            User.findOne({ email }).collation({ locale: 'en', strength: 2 }),
            encryptPassowrd(process.env.ADMIN_PASSWORD),
        ])
        if (existsUser) {
            await User.findByIdAndUpdate({ _id: existsUser._id }, { password })
            return res.sendStatus(200);
        }
        const user = new User({
            email,
            firstName: "Supun",
            lastName: "Disanayaka",
            password,
            role: "admin"
        });

        await user.save();
        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).json("500 Internal Server Error");
    }
})


module.exports = router;