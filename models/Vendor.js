const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { VENDOR_STATUSES } = require('./enums');

const VendorSchema = new Schema(
    {
        user: { type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true },

        displayName: { type: String, required: true, trim: true, index: true },
        legalName: { type: String, trim: true },
        slug: { type: String, lowercase: true, trim: true, unique: true, index: true },

        description: { type: String, trim: true },
        logoUrl: { type: String, trim: true },
        bannerUrl: { type: String, trim: true },

        contactEmail: { type: String, lowercase: true, trim: true },
        contactPhone: { type: String, trim: true },

        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        latitude: { type: Number, trim: true },
        longitude: { type: Number, trim: true },

        serviceAreas: [{ type: String, trim: true }],

        status: { type: String, enum: VENDOR_STATUSES, default: 'pending', index: true },
        statusReason: { type: String },

        kyc: {
            tradeLicenseNo: String,
            documents: [{ label: String, url: String }],
            verifiedAt: Date,
        },

        rating: { count: { type: Number, default: 0 }, average: { type: Number, default: 0 } },
        metrics: { productsCount: { type: Number, default: 0 }, dealsCount: { type: Number, default: 0 } },
    },
    { timestamps: true }
);

module.exports = model('Vendor', VendorSchema);