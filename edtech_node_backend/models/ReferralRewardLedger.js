const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReferralRewardLedger = sequelize.define('ReferralRewardLedger', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  referralId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'referral_id',
    references: {
      model: 'referral_relationships',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  orderId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'order_id'
  },
  rewardType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'reward_type' // 'REGISTRATION' | 'COURSE_PURCHASE' | 'REVERSAL'
  },
  referralLevel: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'referral_level' // 1..4
  },
  amountPaise: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'amount_paise'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'INR'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'AVAILABLE' // 'PENDING', 'AVAILABLE', 'USED', 'REVERSED'
  },
  idempotencyKey: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'idempotency_key'
  }
}, {
  tableName: 'referral_reward_ledger',
  underscored: true,
  timestamps: true,
  indexes: [
    { unique: true, fields: ['idempotency_key'] },
    { fields: ['user_id'] },
    { fields: ['order_id'] },
    { fields: ['reward_type'] },
    { fields: ['status'] }
  ]
});

module.exports = ReferralRewardLedger;

