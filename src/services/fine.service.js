const { Fine } = require('../models');

async function payFine(fineId) {
  const fine = await Fine.findByPk(fineId);
  if (!fine) throw new Error('Fine not found');
  if (fine.paid_at) throw new Error('Fine already paid');

  await fine.update({ paid_at: new Date() });
  return fine;
}

module.exports = { payFine };
