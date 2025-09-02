const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const { DEAL_APPLIES_TO, DEAL_TYPES, DEAL_STATUSES } = require('./enums');

const DealSchema = new Schema(
    {
        vendor: { type: Types.ObjectId, ref: 'Vendor', required: true, index: true },

        title: { type: String, required: true, trim: true, index: true },
        description: { type: String, trim: true },

        appliesTo: { type: String, enum: DEAL_APPLIES_TO, required: true, index: true },
        categoryIds: [{ type: Types.ObjectId, ref: 'Category', index: true }],
        productIds: [{ type: Types.ObjectId, ref: 'Product', index: true }],

        discountType: { type: String, enum: DEAL_TYPES, required: true },
        discountPercent: { type: Number, min: 1, max: 100 }, // when type=percent
        discountAmount: { type: Number, min: 1 },           // when type=flat (AED OFF)

        startAt: { type: Date, required: true, index: true },
        endAt: { type: Date, required: true, index: true },

        status: { type: String, enum: DEAL_STATUSES, default: 'pending', index: true },

        maxRedemptions: { type: Number, min: 1 },
        perCustomerLimit: { type: Number, min: 1 },

        terms: { type: String, trim: true },
    },
    { timestamps: true }
);

DealSchema.index({ vendor: 1, status: 1, startAt: 1, endAt: 1 });

DealSchema.pre('validate', function (next) {
    if (this.discountType === 'percent') {
        if (!this.discountPercent) return next(new Error('discountPercent is required for percent deals'));
        this.discountAmount = undefined;
    } else if (this.discountType === 'flat') {
        if (!this.discountAmount) return next(new Error('discountAmount is required for flat deals'));
        this.discountPercent = undefined;
    }
    if (this.appliesTo === 'categories' && (!this.categoryIds || this.categoryIds.length === 0)) {
        return next(new Error('categoryIds required when appliesTo = categories'));
    }
    if (this.appliesTo === 'products' && (!this.productIds || this.productIds.length === 0)) {
        return next(new Error('productIds required when appliesTo = products'));
    }
    if (this.endAt <= this.startAt) return next(new Error('endAt must be after startAt'));
    next();
});

module.exports = model('Deal', DealSchema);