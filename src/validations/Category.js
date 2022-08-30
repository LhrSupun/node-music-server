const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const CategorySchema = (data) => {
    const Schema = Joi.object({
        name: Joi.string().trim().min(3).max(60).required(),
        status: Joi.boolean(),
    }).unknown();
    return Schema.validate(data);
};

module.exports = { CategorySchema };
