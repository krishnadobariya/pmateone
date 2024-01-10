const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
    {
        fullName: { type: String },
        pumpId: { type: String },
        password: { type: String, default: null },
        countryCode: { type: String, default: null },
        country: { type: String, default: null },
        completeAddress: { type: String, default: null },
        pinCode: { type: String, default: null },
        state: { type: String, default: null },
        phone: { type: Number },
        email: { type: String },
        status: { type: Boolean, default: true },
        otp: { type: String },
        lastLoggedIn: { type: Date },
        lastLoggedOut: { type: Date },
        registerType: {
            type: String,
            default: "normal",
            enum: ["normal", "gmail", "facebook"],
        },
        isNewUser: { type: Boolean, default: true },
        isMobileVerified: { type: Boolean, default: false },
        isMailVerified: { type: Boolean, default: false },
        facebookToken: { type: String },
        profile: { type: String, default: null },
        address: { type: String, default: null },
        city: { type: String, default: null },
        role: {
            type: String,
            enum: ["admin", "manager", "employee"],
        },
        gender: { type: String, default: null },
        forgotPasswordToken: { type: String, default: null },

        deviceToken: { type: String, default: null },
        token: { type: String, default: null },
        deletedOn: { type: String, default: null },
        isDeleted: { type: Boolean, default: false },
        images: [],
        location: {
            type: {
                type: String,
                enum: ["Point"],
            },
            coordinates: {
                type: [Number],
            },
        },
    },
    { timestamps: true }
);

userSchema.index({ location: "2dsphere" });
const User = mongoose.model("User", userSchema);
module.exports = User;

module.exports.hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw new Error("Hashing failed", error);
    }
};

module.exports.comparePasswords = async (inputPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(inputPassword, hashedPassword);
    } catch (error) {
        throw new Error("Comparison failed", error);
    }
};
