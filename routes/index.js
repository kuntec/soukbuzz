const router = require('express').Router();

router.use('/users', require('./users.routes'));
router.use('/vendors', require('./vendors.routes'));
router.use('/customers', require('./customers.routes'));
router.use('/categories', require('./categories.routes'));
router.use('/products', require('./products.routes'));
router.use('/deals', require('./deals.routes'));

module.exports = router;
