const { sequelize, Book, Transaction, Fine, Member } = require('../models');
const { canBorrow, calculateDueDate, calculateFine } = require('./rules.service');
const dayjs = require('dayjs');

// Borrow a book
async function borrowBook(bookId, memberId) {
  return sequelize.transaction(async (t) => {
    await canBorrow(memberId);

    const book = await Book.findByPk(bookId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!book) throw new Error('Book not found');
    if (book.available_copies < 1 || book.status === 'borrowed') {
      throw new Error('Book not available');
    }

    const borrowed_at = new Date();
    const due_date = calculateDueDate(borrowed_at);

    const tx = await Transaction.create(
      {
        book_id: book.id,
        member_id: memberId,
        borrowed_at,
        due_date,
        status: 'active',
      },
      { transaction: t }
    );

    // update book copies / status
    const newAvailable = book.available_copies - 1;
    await book.update(
      {
        available_copies: newAvailable,
        status: newAvailable === 0 ? 'borrowed' : 'available',
      },
      { transaction: t }
    );

    return tx;
  });
}

// Return a book
async function returnBook(transactionId) {
  return sequelize.transaction(async (t) => {
    const tx = await Transaction.findByPk(transactionId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
      include: [Book, Member],
    });

    if (!tx) throw new Error('Transaction not found');
    if (tx.status === 'returned') throw new Error('Already returned');

    const returned_at = new Date();
    const fineAmount = calculateFine(tx.due_date, returned_at);

    // mark transaction returned or overdue->returned
    await tx.update(
      { status: 'returned', returned_at },
      { transaction: t }
    );

    // adjust book copies
    const book = tx.Book;
    const newAvailable = book.available_copies + 1;
    await book.update(
      {
        available_copies: newAvailable,
        status: 'available',
      },
      { transaction: t }
    );

    let fine = null;
    if (fineAmount > 0) {
      fine = await Fine.create(
        {
          member_id: tx.member_id,
          transaction_id: tx.id,
          amount: fineAmount,
        },
        { transaction: t }
      );
    }

    return { tx, fine };
  });
}

// Mark overdue transactions and suspend members with ≥3 overdue
async function refreshOverduesAndSuspensions() {
  return sequelize.transaction(async (t) => {
    const now = new Date();

    // 1) mark active transactions as overdue where due_date < now
    await Transaction.update(
      { status: 'overdue' },
      {
        where: {
          status: 'active',
          due_date: { [require('sequelize').Op.lt]: now },
        },
        transaction: t,
      }
    );

    // 2) suspend members with 3+ overdue
    const { Op } = require('sequelize');

    const overdueCounts = await Transaction.findAll({
      attributes: [
        'member_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'overdueCount'],
      ],
      where: { status: 'overdue' },
      group: ['member_id'],
      having: sequelize.where(
        sequelize.fn('COUNT', sequelize.col('id')),
        { [Op.gte]: 3 }
      ),
      transaction: t,
    });

    const memberIdsToSuspend = overdueCounts.map((row) => row.member_id);

    if (memberIdsToSuspend.length > 0) {
      await Member.update(
        { status: 'suspended' },
        {
          where: { id: { [Op.in]: memberIdsToSuspend } },
          transaction: t,
        }
      );
    }
  });
}

module.exports = {
  borrowBook,
  returnBook,
  refreshOverduesAndSuspensions,
};
