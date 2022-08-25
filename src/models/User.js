const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
        firstName: String,
        lastName: String,
        password: String,
        lastSeen: {
            type: Date
        },
        verificationTokenTimeStamp: {
            type: Number,
            default: 0
        },
        verificationToken: String,
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
UserSchema.virtual('fullName').get(() => `${this.firstName} ${this.lastName ? this.lastName : ""}`)


module.exports = mongoose.model("User", UserSchema);