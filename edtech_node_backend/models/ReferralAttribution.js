const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReferralAttribution = sequelize.define('ReferralAttribution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  anonymousId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'anonymous_id'
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
  referralCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'referral_code'
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
    defaultValue: 'pending'
  }
}, {
  tableName: 'referral_attributions',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['anonymous_id'] },
    { fields: ['referral_code'] },
    { fields: ['user_id'] }
  ]
});

module.exports = ReferralAttribution;
