const { Op } = require('sequelize');

function buildNetworkUserSearch(rawValue) {
  const value = String(rawValue || '').trim();
  if (!value) {
    return null;
  }

  if (/^\d+$/.test(value)) {
    return {
      type: 'id',
      value,
      where: { id: Number(value) }
    };
  }

  if (value.includes('@')) {
    return {
      type: 'email',
      value: value.toLowerCase(),
      where: { email: { [Op.iLike]: `%${value}%` } }
    };
  }

  return {
    type: 'name',
    value,
    where: {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${value}%` } },
        { lastName: { [Op.iLike]: `%${value}%` } },
        { email: { [Op.iLike]: `%${value}%` } }
      ]
    }
  };
}

module.exports = {
  buildNetworkUserSearch,
};
