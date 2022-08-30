const mongoose = require("mongoose");
const { Schema } = mongoose;

const MovieSchema = new Schema(
    {
        title: String,
        categories: [{ _id: { type: Schema.ObjectId, ref: "Category" } }],
        year: Number,
        price: { type: Number, default: 0 },
        description: String,
        createdBy: { type: Schema.ObjectId, ref: "User" },
        status: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        toObject: {
            virtuals: true,
        },
        toJSON: {
            virtuals: true,
        },
    });

MovieSchema.index({ title: 1 },
    { collation: { locale: 'en', strength: 2 }, unique: true })

module.exports = mongoose.model("Movie", MovieSchema);