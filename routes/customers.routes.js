const router = require('express').Router();
const { Customer } = require('../models');
const asNum = (x, d) => (isNaN(+x) ? d : +x);

// Create (body must include user: <UserId>)
router.post('/', async (req, res, next) => {
    try {
        const doc = await Customer.create(req.body);
        res.status(201).json(doc);
    } catch (e) { next(e); }
});

// Get List
router.get('/', async (req, res, next) => {
    try {
        const { q, city, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (q) filter.fullName = { $regex: q, $options: 'i' };
        if (city) filter.city = city;
        const items = await Customer.find(filter)
            .skip((asNum(page, 1) - 1) * asNum(limit, 20))
            .limit(asNum(limit, 20))
            .sort('-createdAt');
        res.json(items);
    } catch (e) { next(e); }
});

// Read / Update / Delete
router.get('/:id', async (req, res, next) => {
    try {
        const doc = await Customer.findById(req.params.id); if (!doc) return res.status(404).json({ message: 'Not found' }); res.json(doc);
    } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
    try {
        const doc = await Customer.findOneAndReplace(
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
        const out = await Customer.findByIdAndDelete(req.params.id); if (!out) return res.status(404).json({ message: 'Not found' }); res.json({ deleted: true });
    } catch (e) { next(e); }
});

module.exports = router;
