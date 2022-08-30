const mongoose = require("mongoose");
const { Schema } = mongoose;

const CategorySchema = new Schema(
    {
        name: String,
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

CategorySchema.index({ name: 1 },
    { collation: { locale: 'en', strength: 2 }, unique: true })

module.exports = mongoose.model("Category", CategorySchema);