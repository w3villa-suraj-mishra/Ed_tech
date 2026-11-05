const { buildNetworkUserSearch } = require('../modules/referrals/utils/networkSearch');

describe('buildNetworkUserSearch', () => {
  test('supports direct numeric user ID lookup', () => {
    expect(buildNetworkUserSearch('123')).toMatchObject({
      type: 'id',
      value: '123'
    });
  });

  test('supports email lookup and name lookup', () => {
    expect(buildNetworkUserSearch('sam@example.com')).toMatchObject({
      type: 'email',
      value: 'sam@example.com'
    });

    expect(buildNetworkUserSearch('Sam Sharma')).toMatchObject({
      type: 'name',
      value: 'Sam Sharma'
    });
  });

  test('creates a case-insensitive name search clause', () => {
    const clause = buildNetworkUserSearch('Sam Sharma');
    expect(clause.where).toEqual({
      [require('sequelize').Op.or]: [
        { firstName: { [require('sequelize').Op.iLike]: '%Sam Sharma%' } },
        { lastName: { [require('sequelize').Op.iLike]: '%Sam Sharma%' } },
        { email: { [require('sequelize').Op.iLike]: '%Sam Sharma%' } }
      ]
    });
  });
});
