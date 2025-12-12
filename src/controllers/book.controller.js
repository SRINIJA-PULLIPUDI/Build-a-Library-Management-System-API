const { Book } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // Create book OR increase stock if ISBN already exists
  async create(req, res) {
    try {
      const { isbn, total_copies } = req.body;

      // Check if book already exists
      const existing = await Book.findOne({ where: { isbn } });

      if (existing) {
        const addedCopies = Number(total_copies) || 0;

        const newTotal = existing.total_copies + addedCopies;
        const newAvailable = existing.available_copies + addedCopies;

        await existing.update({
          total_copies: newTotal,
          available_copies: newAvailable,
          status: newAvailable > 0 ? 'available' : existing.status
        });

        return res.status(200).json({
          message: "Book already exists — increased stock",
          book: existing
        });
      }

      // Otherwise create a new book
      const newBook = await Book.create(req.body);
      return res.status(201).json(newBook);

    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  // GET /books
  async list(req, res) {
    const books = await Book.findAll();
    res.json(books);
  },

  // GET /books/:id
  async getById(req, res) {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  },

  // PUT /books/:id
  async update(req, res) {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    await book.update(req.body);
    res.json(book);
  },

  // DELETE /books/:id
  async remove(req, res) {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    await book.destroy();
    res.status(204).end();
  },

  // GET /books/available
  async listAvailable(req, res) {
    const books = await Book.findAll({
      where: {
        available_copies: { [Op.gt]: 0 },
        status: 'available'
      }
    });

    res.json(books);
  }
};
