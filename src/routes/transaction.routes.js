const router = require('express').Router();
const controller = require('../controllers/transaction.controller');

router.post('/borrow', controller.borrow);           // borrow a book
router.post('/:id/return', controller.return);       // return a book
router.get('/', controller.list);
router.get('/overdue', controller.overdue);
router.get('/:id', controller.getById);

module.exports = router;
