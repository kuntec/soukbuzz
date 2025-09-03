const router = require('express').Router();
const { Category } = require('../models');
const asNum = (x, d) => (isNaN(+x) ? d : +x);

// Create global category (vendor=null)
router.post('/global', async (req, res, next) => {
    try {
        const { name, slug, description, parent, sortOrder } = req.body;
        const doc = await Category.create({ name, slug, description, parent: parent || null, sortOrder, vendor: null });
        res.status(201).json(doc);
    } catch (e) { next(e); }
});

// Create vendor-scoped category (body must include vendor: <VendorId>)
router.post('/vendor', async (req, res, next) => {
    try {
        const { name, slug, description, parent, sortOrder, vendor } = req.body;
        const doc = await Category.create({ name, slug, description, parent: parent || null, sortOrder, vendor });
        res.status(201).json(doc);
    } catch (e) { next(e); }
});

// List (global or by vendor)
router.get('/', async (req, res, next) => {
    try {
        const { vendorId, q, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (vendorId === 'global') filter.vendor = null;
        else if (vendorId) filter.vendor = vendorId;
        if (q) filter.name = { $regex: q, $options: 'i' };
        const items = await Category.find(filter)
            .skip((asNum(page, 1) - 1) * asNum(limit, 50))
            .limit(asNum(limit, 50))
            .sort({ sortOrder: 1, name: 1 });
        res.json(items);
    } catch (e) { next(e); }
});

// Read / Update / Delete
router.get('/:id', async (req, res, next) => {
    try {
        const doc = await Category.findById(req.params.id); if (!doc) return res.status(404).json({ message: 'Not found' }); res.json(doc);
    } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
    try {
        const doc = await Category.findOneAndReplace(
            { _id: req.params.id },
            req.body,
            { new: true }
        );

        if (!doc) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.json(doc);
    } catch (e) {
        next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const out = await Category.findByIdAndDelete(req.params.id); if (!out) return res.status(404).json({ message: 'Not found' }); res.json({ deleted: true });
    } catch (e) { next(e); }
});

module.exports = router;
