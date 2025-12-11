const { Transaction, Fine, Member } = require('../models');
const dayjs = require('dayjs');

const MAX_BORROW_LIMIT = 3;
const DAILY_FINE = 0.5;
const LOAN_DAYS = 14;

async function canBorrow(memberId) {
  // member status
  const member = await Member.findByPk(memberId);
  if (!member) throw new Error('Member not found');
  if (member.status !== 'active') {
    throw new Error('Member is not active');
  }

  // unpaid fines
  const unpaid = await Fine.count({
    where: { member_id: memberId, paid_at: null },
  });
  if (unpaid > 0) throw new Error('Member has unpaid fines');

  // active borrows
  const active = await Transaction.count({
    where: { member_id: memberId, status: 'active' },
  });
  if (active >= MAX_BORROW_LIMIT) {
    throw new Error('Borrow limit reached (3 active books max)');
  }
}

function calculateDueDate(borrowedAt) {
  return dayjs(borrowedAt).add(LOAN_DAYS, 'day').toDate();
}

function calculateFine(due_date, returned_at) {
  const daysLate = dayjs(returned_at).diff(due_date, 'day');
  if (daysLate <= 0) return 0;
  return daysLate * DAILY_FINE;
}

module.exports = {
  MAX_BORROW_LIMIT,
  DAILY_FINE,
  LOAN_DAYS,
  canBorrow,
  calculateDueDate,
  calculateFine,
};
