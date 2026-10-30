const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReferralCode = sequelize.define('ReferralCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  referralCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'referral_code'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'referral_codes',
  underscored: true,
  timestamps: true,
  indexes: [
    { unique: true, fields: ['user_id'] },
    { unique: true, fields: ['referral_code'] }
  ]
});

module.exports = ReferralCode;

