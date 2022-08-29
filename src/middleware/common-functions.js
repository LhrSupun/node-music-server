const jwt = require('jsonwebtoken');
const randomString = require('randomstring');
const bcrypt = require("bcryptjs");

const getToken = (data, key, expiresIn) => jwt.sign({ userId: data.userId, email: data.email, role: data.role }, key, { expiresIn });

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

const comparePassword = async (currant, received) => {
    const validPassword = await bcrypt.compare(currant, received);
    return validPassword ? false : true;
}

const joiErrorFormatter = (RawErrors) => {
    const errors = {};
    const Details = RawErrors.details;

    Details.map((detail) => {
        errors[detail.path] = [detail.message];
    });
    return errors;
};

const validateInput = (schema, data) => {
    const validInput = schema(data, { abortEarly: false });

    if (validInput.error) {
        return joiErrorFormatter(validInput.error);
    }
    return validInput;
};

module.exports = {
    getToken,
    verifyToken,
    encryptPassowrd,
    comparePassword,
    validateInput,
};
