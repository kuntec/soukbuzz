const router = require('express').Router();
const { User, Vendor, Customer, Product, Deal, Category } = require('../models');

const asNum = (x, d) => (isNaN(+x) ? d : +x);


// Create
router.post('/', async (req, res, next) => {
    try {
        const doc = await User.create(req.body);
        res.status(201).json(doc);
    } catch (e) {
        next(e);
    }
});

// Get List
router.get('/', async (req, res, next) => {
    try {
        const { role, status, q, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (status) filter.status = status;
        if (q) filter.email = { $regex: q, $options: 'i' };
        const items = await User.find(filter)
            .skip((asNum(page, 1) - 1) * asNum(limit, 20))
            .limit(asNum(limit, 20))
            .sort('-createdAt');
        res.json(items);
    } catch (e) {
        next(e);
    }
});

//Read / Update / Delete
router.get('/:id', async (req, res, next) => {
    try {
        const doc = await User.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Not found' }); res.json(doc);

    } catch (e) {
        next(e);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const doc = await User.findOneAndReplace(
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
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Not found' });

        if (user.role === 'vendor') {
            const vendor = await Vendor.findOne({ user: user._id });
            if (vendor) {
                const products = await Product.find({ vendor: vendor._id }).select('_id');
                const productIds = products.map(p => p._id);
                const deals = await Deal.find({ vendor: vendor._id }).select('_id');
                const dealIds = deals.map(d => d._id);

                await Product.deleteMany({ _id: { $in: productIds } });
                await Deal.deleteMany({ _id: { $in: dealIds } });
                await Category.deleteMany({ vendor: vendor._id });
                await Vendor.deleteOne({ _id: vendor._id });

                if (productIds.length) {
                    await Customer.updateMany(
                        { favoriteProducts: { $in: productIds } },
                        { $pull: { favoriteProducts: { $in: productIds } } }
                    );
                }
                if (dealIds.length) {
                    await Customer.updateMany(
                        { favoriteDeals: { $in: dealIds } },
                        { $pull: { favoriteDeals: { $in: dealIds } } }
                    );
                }
            }
        } else if (user.role === 'customer') {
            await Customer.deleteMany({ user: user._id });
        }

        await User.deleteOne({ _id: user._id });
        res.json({ deleted: true });
    } catch (e) { next(e); }
});


module.exports = router;