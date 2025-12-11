const { Transaction, Book, Member } = require('../models');
const { borrowBook, returnBook, refreshOverduesAndSuspensions } = require('../services/borrow.service');

module.exports = {
  // POST /transactions/borrow
  async borrow(req, res) {
    const { book_id, member_id } = req.body;
    try {
      const tx = await borrowBook(book_id, member_id);
      res.status(201).json(tx);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  // POST /transactions/:id/return
  async return(req, res) {
    try {
      const result = await returnBook(req.params.id);
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  async list(req, res) {
    const txs = await Transaction.findAll({ include: [Book, Member] });
    res.json(txs);
  },

  async getById(req, res) {
    const tx = await Transaction.findByPk(req.params.id, {
      include: [Book, Member],
    });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json(tx);
  },

  // GET /transactions/overdue
  async overdue(req, res) {
    await refreshOverduesAndSuspensions();
    const txs = await Transaction.findAll({
      where: { status: 'overdue' },
      include: [Book, Member],
    });
    res.json(txs);
  },
};
