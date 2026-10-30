const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReferralTree = sequelize.define('ReferralTree', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ancestorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'ancestor_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  descendantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'descendant_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  depth: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'referral_tree',
  underscored: true,
  timestamps: true,
  indexes: [
    { unique: true, fields: ['ancestor_id', 'descendant_id'] },
    { fields: ['ancestor_id'] },
    { fields: ['descendant_id'] },
    { fields: ['depth'] }
  ]
});

module.exports = ReferralTree;

