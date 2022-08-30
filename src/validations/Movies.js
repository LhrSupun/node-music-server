const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const MovieCreateSchema = (data) => {
    const Schema = Joi.object({
        title: Joi.string().trim().min(3).max(60).required(),
        price: Joi.number().precision(2).required(),
        year: Joi.string().length(4).regex(/^\d+$/).required(),
        description: Joi.string().trim().min(5).max(500).required(),
        thumbnail: Joi.string().trim().min(4).required(),
        categories: Joi.array().items(Joi.objectId().required()),
    }).unknown();
    return Schema.validate(data);
};

const MovieUpdateSchema = (data) => {
    const Schema = Joi.object({
        title: Joi.string().trim().min(3).max(60),
        price: Joi.number().precision(2),
        year: Joi.string().length(4).regex(/^\d+$/),
        description: Joi.string().trim().min(5).max(500),
        thumbnail: Joi.string().trim().min(4),
        categories: Joi.array().items(Joi.objectId()),
    }).unknown();
    return Schema.validate(data);
};


module.exports = { MovieCreateSchema, MovieUpdateSchema };
