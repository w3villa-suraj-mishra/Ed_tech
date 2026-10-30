const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WalletTransaction = sequelize.define('WalletTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  walletId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'wallet_id',
    references: {
      model: 'wallets',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  amountPaise: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'amount_paise' // Signed: positive = credit, negative = debit
  },
  transactionType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'transaction_type' // 'CREDIT_REWARD', 'DEBIT_PURCHASE', 'REVERSAL_REFUND', 'ADJUSTMENT'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'SUCCESS' // 'SUCCESS', 'FAILED', 'REVERSED'
  },
  referenceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'reference_type' // 'REWARD_LEDGER', 'ENROLLMENT', 'ADMIN_OVERRIDE'
  },
  referenceId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'reference_id'
  },
  balanceAfterPaise: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'balance_after_paise'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'wallet_transactions',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['wallet_id'] },
    { fields: ['user_id'] },
    { fields: ['transaction_type'] },
    { fields: ['reference_type', 'reference_id'] }
  ]
});

module.exports = WalletTransaction;

