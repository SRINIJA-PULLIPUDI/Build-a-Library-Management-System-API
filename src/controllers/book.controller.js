const { Book } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const book = await Book.create(req.body);
      res.status(201).json(book);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  async list(req, res) {
    const books = await Book.findAll();
    res.json(books);
  },

  async getById(req, res) {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  },

  async update(req, res) {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    await book.update(req.body);
    res.json(book);
  },

  async remove(req, res) {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    await book.destroy();
    res.status(204).end();
  },

  async listAvailable(req, res) {
    const { Op } = require('sequelize');
    const books = await Book.findAll({
      where: {
        available_copies: { [Op.gt]: 0 },
        status: 'available',
      },
    });
    res.json(books);
  },
};
