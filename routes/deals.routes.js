const router = require('express').Router();
const { Deal, Customer } = require('../models');
const asNum = (x, d) => (isNaN(+x) ? d : +x);

// Create (body must include vendor: <VendorId>)
router.post('/', async (req, res, next) => {
    try {
        const doc = await Deal.create(req.body);
        res.status(201).json(doc);
    } catch (e) { next(e); }
});

// List (filters)
router.get('/', async (req, res, next) => {
    try {
        const { status, vendorId, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (vendorId) filter.vendor = vendorId;
        const items = await Deal.find(filter)
            .skip((asNum(page, 1) - 1) * asNum(limit, 20))
            .limit(asNum(limit, 20))
            .sort('-createdAt');
        res.json(items);
    } catch (e) { next(e); }
});

// Live deals
router.get('/live', async (req, res, next) => {
    try {
        const { vendorId, categoryId, productId, at } = req.query;
        const t = at ? new Date(at) : new Date();
        const filter = { status: 'active', startAt: { $lte: t }, endAt: { $gte: t } };
        if (vendorId) filter.vendor = vendorId;

        if (categoryId && productId) {
            filter.$or = [
                { appliesTo: 'all' },
                { appliesTo: 'categories', categoryIds: categoryId },
                { appliesTo: 'products', productIds: productId }
            ];
        } else if (categoryId) {
            filter.$or = [{ appliesTo: 'all' }, { appliesTo: 'categories', categoryIds: categoryId }];
        } else if (productId) {
            filter.$or = [{ appliesTo: 'all' }, { appliesTo: 'products', productIds: productId }];
        }

        const items = await Deal.find(filter).sort('-createdAt');
        res.json(items);
    } catch (e) { next(e); }
});

// Read / Update / Delete
router.get('/:id', async (req, res, next) => {
    try {
        const doc = await Deal.findById(req.params.id); if (!doc) return res.status(404).json({ message: 'Not found' }); res.json(doc);
    } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
    try {
        const doc = await Deal.findOneAndReplace(
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
        const del = await Deal.findByIdAndDelete(req.params.id);
        if (!del) return res.status(404).json({ message: 'Not found' });
        await Customer.updateMany(
            { favoriteDeals: req.params.id },
            { $pull: { favoriteDeals: req.params.id } }
        );
        res.json({ deleted: true });
    } catch (e) { next(e); }
});



module.exports = router;
