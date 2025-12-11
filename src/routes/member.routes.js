const router = require('express').Router();
const controller = require('../controllers/member.controller');

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.get('/:id/borrowed', controller.borrowedBooks);

module.exports = router;
