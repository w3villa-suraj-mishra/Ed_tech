const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReferralAttribution = sequelize.define('ReferralAttribution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  referredIdentityHash: {
    type: DataTypes.STRING(64),
    allowNull: true,
    field: 'referred_identity_hash'
  },
  referrerUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'referrer_user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  referralCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'referral_code'
  },
  originalAttributedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'original_attributed_at'
  },
  currentUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'current_user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  anonymousId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'anonymous_id'
  },
  channel: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'web'
  },
  landingPage: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: '/register',
    field: 'landing_page'
  },
  campaign: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'referral'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'attributed'
  }
}, {
  tableName: 'referral_attributions',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['referred_identity_hash'] },
    { fields: ['current_user_id'] },
    { fields: ['referrer_user_id'] },
    { fields: ['referral_code'] },
    { fields: ['anonymous_id'] },
    { fields: ['user_id'] }
  ]
});

module.exports = ReferralAttribution;
