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
                await Product.deleteMany({ vendor: vendor._id });
                await Deal.deleteMany({ vendor: vendor._id });
                await Category.deleteMany({ vendor: vendor._id });
                await Vendor.deleteOne({ _id: vendor._id });
            }
        } else if (user.role === 'customer') {
            const customer = await Customer.findOne({ user: user._id });

            if (customer) {
                await Customer.deleteOne({ user: user._id });

            }
        }

        await User.deleteOne({ _id: user._id });
        res.json({ deleted: true });
    } catch (e) {
        next(e);
    }
});


module.exports = router;