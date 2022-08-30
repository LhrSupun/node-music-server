const mongoose = require("mongoose");
const { Schema } = mongoose;

const PurchaseSchema = new Schema(
    {
        paymentDetails: String,
        total: Number,
        movies: [
            {
                _id: {
                    type: Schema.ObjectId,
                    ref: "Movie",
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                }
            }
        ],
        description: String,
        user: { type: Schema.ObjectId, ref: "User" },
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


module.exports = mongoose.model("Purchase", PurchaseSchema);