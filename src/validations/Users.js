const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const UserSchema = (data) => {
    const Schema = Joi.object({
        firstName: Joi.string().trim().min(3).max(60).required(),
        lastName: Joi.string().trim().min(3).max(15),
        email: Joi.string().trim().lowercase().email().required(),
        password: Joi.string().trim().min(3).required(),
        role: Joi.string().valid('user', 'admin'),
    }).unknown();
    return Schema.validate(data);
};

const LoginSchema = (data) => {
    const Schema = Joi.object({
        email: Joi.string().trim().lowercase().email().required(),
        password: Joi.string().trim().min(3).required(),
    }).unknown();

    return Schema.validate(data);
};

const ChangePasswordSchema = (data) => {
    const Schema = Joi.object({
        oldPassword: Joi.string().trim().min(3).required(),
        newPassword: Joi.string().trim().min(3).required(),
    }).unknown();

    return Schema.validate(data);
};


module.exports = { UserSchema, LoginSchema, ChangePasswordSchema };
