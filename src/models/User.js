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

        // verificationTokenTimeStamp: {
        //     type: Number,
        //     default: 0
        // },
        // verificationToken: String,
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
UserSchema.virtual('fullName').get(function () { return `${this.firstName} ${this.lastName ? this.lastName : ""}` })

UserSchema.index({ email: 1 },
    { collation: { locale: 'en', strength: 2 }, unique: true })

module.exports = mongoose.model("User", UserSchema);