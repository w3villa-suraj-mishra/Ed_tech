const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReferralRelationship = sequelize.define('ReferralRelationship', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  referrerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'referrer_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  referredUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'referred_user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  referralCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'referral_code'
  },
  attributionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'attribution_id'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'active'
  },
  registeredAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'registered_at'
  }
}, {
  tableName: 'referral_relationships',
  underscored: true,
  timestamps: true,
  indexes: [
    { unique: true, fields: ['referred_user_id'] },
    { fields: ['referrer_id'] },
    { fields: ['referral_code'] }
  ]
});

module.exports = ReferralRelationship;

