const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wallet = sequelize.define('Wallet', {
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
  availableBalancePaise: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    field: 'available_balance_paise'
  },
  pendingBalancePaise: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    field: 'pending_balance_paise'
  },
  lifetimeEarnedPaise: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    field: 'lifetime_earned_paise'
  },
  lifetimeSpentPaise: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    field: 'lifetime_spent_paise'
  }
}, {
  tableName: 'wallets',
  underscored: true,
  timestamps: true,
  indexes: [
    { unique: true, fields: ['user_id'] }
  ]
});

module.exports = Wallet;

