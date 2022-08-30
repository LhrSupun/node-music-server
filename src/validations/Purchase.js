const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const PurchaseSchema = (data) => {
    const Schema = Joi.object({
        paymentDetails: Joi.string().trim().min(3).max(60).required(),
        description: Joi.string().trim().min(5).max(500).required(),
        movies: Joi.array().items(Joi.objectId().required()),
    }).unknown();
    return Schema.validate(data);
};

const PurchaseUpdateSchema = (data) => {
    const Schema = Joi.object({
        paymentDetails: Joi.string().trim().min(3).max(60),
        description: Joi.string().trim().min(5).max(500),
        movies: Joi.array().items(Joi.objectId()),
    }).unknown();
    return Schema.validate(data);
};


module.exports = { PurchaseSchema, PurchaseUpdateSchema };
