const jwt = require('jsonwebtoken');
const randomString = require('randomstring');
const bcrypt = require("bcryptjs");

const getToken = (userId, key, expiresIn) => jwt.sign(
    {
        userId,
    },
    key,
    {
        expiresIn,
    },
);

const verifyToken = () => {
    const verificationToken = randomString.generate({
        length: 256, // enough
        charset: 'alphanumeric',
    });
    const verificationTokenTimeStamp = new Date();
    return {
        verificationToken,
        verificationTokenTimeStamp: verificationTokenTimeStamp.getTime(),
    };
};

const encryptPassowrd = async (password, cycles = 10) => {
    const salt = await bcrypt.genSalt(cycles);
    const encrypted = await bcrypt.hash(password, salt);
    return encrypted;
}

module.exports = {
    getToken,
    verifyToken,
    encryptPassowrd,
};
