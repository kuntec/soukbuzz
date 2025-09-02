const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const CustomerSchema = new Schema(
    {
        user: { type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
        fullName: { type: String, trim: true },
        avatarUrl: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        latitude: { type: Number, trim: true },
        longitude: { type: Number, trim: true },
        favoriteVendors: [{ type: Types.ObjectId, ref: 'Vendor' }],
        favoriteProducts: [{ type: Types.ObjectId, ref: 'Product' }],
        preferredCategoryIds: [{ type: Types.ObjectId, ref: 'Category' }],
        wishlistDeals: [{ type: Types.ObjectId, ref: 'Deal', index: true }]
    },
    { timestamps: true }
);

module.exports = model('Customer', CustomerSchema);