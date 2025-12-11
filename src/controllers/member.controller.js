const { Member, Transaction, Book } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const member = await Member.create(req.body);
      res.status(201).json(member);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  async list(req, res) {
    const members = await Member.findAll();
    res.json(members);
  },

  async getById(req, res) {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  },

  async update(req, res) {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    await member.update(req.body);
    res.json(member);
  },

  async remove(req, res) {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    await member.destroy();
    res.status(204).end();
  },

  // GET /members/:id/borrowed
  async borrowedBooks(req, res) {
    const memberId = req.params.id;

    const transactions = await Transaction.findAll({
      where: { member_id: memberId, status: 'active' },
      include: [Book],
    });

    res.json(transactions);
  },
};
