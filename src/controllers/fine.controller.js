const { Fine, Transaction, Member } = require('../models');
const { payFine } = require('../services/fine.service');

module.exports = {
  async list(req, res) {
    const fines = await Fine.findAll({ include: [Member, Transaction] });
    res.json(fines);
  },

  async getById(req, res) {
    const fine = await Fine.findByPk(req.params.id, {
      include: [Member, Transaction],
    });
    if (!fine) return res.status(404).json({ error: 'Fine not found' });
    res.json(fine);
  },

  // POST /fines/:id/pay
  async pay(req, res) {
    try {
      const fine = await payFine(req.params.id);
      res.json(fine);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },
};
