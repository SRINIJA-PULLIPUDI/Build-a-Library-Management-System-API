const router = require('express').Router();
const controller = require('../controllers/fine.controller');

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/:id/pay', controller.pay);

module.exports = router;
