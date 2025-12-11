const express = require('express');
const bodyParser = require('express').json;
const { sequelize } = require('./models');

const bookRoutes = require('./routes/book.routes');
const memberRoutes = require('./routes/member.routes');
const transactionRoutes = require('./routes/transaction.routes');
const fineRoutes = require('./routes/fine.routes');

const app = express();
app.use(bodyParser());

// routes
app.use('/books', bookRoutes);
app.use('/members', memberRoutes);
app.use('/transactions', transactionRoutes);
app.use('/fines', fineRoutes);

// health check
app.get('/', (req, res) => {
  res.json({ status: 'Library API running...' });
});

// sync DB once at startup (for development)
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await sequelize.sync({ alter: true }); // for dev; in prod use migrations
    console.log('Models synchronized');
  } catch (e) {
    console.error('DataBase init error:', e);
  }
}
initDatabase();

module.exports = app;
