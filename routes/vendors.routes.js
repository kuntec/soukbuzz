const router = require('express').Router();
const { Vendor } = require('../models');
const asNum = (x, d) => (isNaN(+x) ? d : +x);

// Create (Body Must include UserId)
router.post('/', async (req, res, next) => {
    try {
        const doc = await Vendor.create(req.body);
        res.status(201).json(doc);
    } catch (e) {
        next(e);
    }
});

// Get List
router.get('/', async (req, res, next) => {
    try {
        const { status, q, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (q) filter.displayName = { $regex: q, $options: 'i' };
        const items = await Vendor.find(filter)
            .skip((asNum(page, 1) - 1) * asNum(limit, 20))
            .limit(asNum(limit, 20))
            .sort('-createdAt');
        res.json(items);
    } catch (e) {
        next(e);
    }
});

// Read / Update / Delete
router.get('/:id', async (req, res, next) => {
    try {
        const doc = await Vendor.findById(req.params.id); if (!doc) return res.status(404).json({ message: 'Not found' }); res.json(doc);
    } catch (e) {
        next(e);
    }
});
router.patch('/:id', async (req, res, next) => {
    try {
        const doc = await Vendor.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }); if (!doc) return res.status(404).json({ message: 'Not found' }); res.json(doc);
    } catch (e) {
        next(e);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const out = await Vendor.findByIdAndDelete(req.params.id); if (!out) return res.status(404).json({ message: 'Not found' }); res.json({ deleted: true });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
