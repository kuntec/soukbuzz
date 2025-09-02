const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const CategorySchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, lowercase: true, trim: true },
        description: { type: String, trim: true },

        vendor: { type: Types.ObjectId, ref: 'Vendor', default: null, index: true }, // null = global
        parent: { type: Types.ObjectId, ref: 'Category', default: null },

        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// unique per vendor
CategorySchema.index(
    { vendor: 1, slug: 1 },
    { unique: true, partialFilterExpression: { vendor: { $type: 'objectId' } } }
);
// unique global when vendor is null
CategorySchema.index(
    { slug: 1 },
    { unique: true, partialFilterExpression: { vendor: null } }
);

module.exports = model('Category', CategorySchema);