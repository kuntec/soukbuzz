const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { USER_ROLES, USER_STATUSES } = require('./enums');

const UserSchema = new Schema(
    {
        email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
        phone: { type: String, trim: true, index: true },
        passwordHash: { type: String, required: true },

        role: { type: String, enum: USER_ROLES, required: true, index: true }, // single role only
        status: { type: String, enum: USER_STATUSES, default: 'pending', index: true },

        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },

        lastLoginAt: Date,
        meta: Schema.Types.Mixed,
    },
    { timestamps: true }
);

module.exports = model('User', UserSchema);