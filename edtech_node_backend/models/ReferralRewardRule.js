const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReferralRewardRule = sequelize.define('ReferralRewardRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rewardType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'reward_type' // 'REGISTRATION' | 'COURSE_PURCHASE'
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0 // 0 for registration, 1 to 4 for purchase
  },
  rewardPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'reward_percentage'
  },
  fixedAmountPaise: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    field: 'fixed_amount_paise'
  },
  maximumRewardPaise: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'maximum_reward_paise'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  effectiveFrom: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'effective_from'
  },
  effectiveUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'effective_until'
  }
}, {
  tableName: 'referral_reward_rules',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['reward_type', 'level', 'is_active'] }
  ]
});

module.exports = ReferralRewardRule;

