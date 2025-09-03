const router = require('express').Router();
const { Product } = require('../models');
const asNum = (x, d) => (isNaN(+x) ? d : +x);

// Create (body must include vendor: <VendorId>)
router.post('/', async (req, res, next) => {
    try { const doc = await Product.create(req.body); res.status(201).json(doc); } catch (e) { next(e); }
});

// List / search
router.get('/', async (req, res, next) => {
    try {
        const { q, categoryId, vendorId, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (q) filter.$text = { $search: q };
        if (categoryId) filter.categories = categoryId;
        if (vendorId) filter.vendor = vendorId;
        const items = await Product.find(filter)
            .skip((asNum(page, 1) - 1) * asNum(limit, 20))
            .limit(asNum(limit, 20))
            .sort('-createdAt');
        res.json(items);
    } catch (e) { next(e); }
});

// Read / Update / Delete
router.get('/:id', async (req, res, next) => {
    try {
        const doc = await Product.findById(req.params.id); if (!doc) return res.status(404).json({ message: 'Not found' }); res.json(doc);
    } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
    try {
        const doc = await Product.findOneAndReplace(
            { _id: req.params.id },
            req.body,
            { new: true }
        );
        if (!doc) return res.status(404).json({ message: 'Not found' });
        res.json(doc);
    } catch (e) {
        next(e);
    }
});


router.delete('/:id', async (req, res, next) => {
    try {
        const del = await Product.findByIdAndDelete(req.params.id);
        if (!del) return res.status(404).json({ message: 'Not found' });
        await Customer.updateMany(
            { favoriteProducts: req.params.id },
            { $pull: { favoriteProducts: req.params.id } }
        );
        res.json({ deleted: true });
    } catch (e) { next(e); }
});

module.exports = router;
