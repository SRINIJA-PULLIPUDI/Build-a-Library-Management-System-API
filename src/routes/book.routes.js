const router = require('express').Router();
const controller = require('../controllers/book.controller');

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/available', controller.listAvailable);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
