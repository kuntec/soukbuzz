const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { PRODUCT_STATUSES } = require('./enums');

const MoneySchema = new Schema(
    {
        currency: { type: String, default: 'AED' },
        amount: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const ProductSchema = new Schema(
    {
        vendor: { type: Types.ObjectId, ref: 'Vendor', required: true, index: true },

        name: { type: String, required: true, trim: true, index: true },
        slug: { type: String, required: true, lowercase: true, trim: true },
        description: { type: String, trim: true },

        images: [{ url: String, alt: String }],

        categories: [{ type: Types.ObjectId, ref: 'Category', index: true }],
        sku: { type: String, trim: true, index: true },

        price: { type: MoneySchema, required: true },
        stockQty: { type: Number, default: 0, min: 0 },

        attributes: Schema.Types.Mixed,
        status: { type: String, enum: PRODUCT_STATUSES, default: 'active', index: true },

        latitude: { type: Number, trim: true },
        longitude: { type: Number, trim: true },
    },
    { timestamps: true }
);

ProductSchema.index({ vendor: 1, slug: 1 }, { unique: true });
ProductSchema.index({ name: 'text', description: 'text' });

module.exports = model('Product', ProductSchema);