const { Wallet, WalletTransaction, sequelize } = require('../../../models');
const logger = require('../../../utils/logger');

class WalletService {
  /**
   * Retrieves or initializes a wallet for a user within a transaction
   */
  async getOrCreateWallet(userId, transaction = null) {
    let wallet = await Wallet.findOne({
      where: { userId },
      transaction,
      lock: transaction ? transaction.LOCK.UPDATE : undefined
    });

    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        availableBalancePaise: 0,
        pendingBalancePaise: 0,
        lifetimeEarnedPaise: 0,
        lifetimeSpentPaise: 0
      }, { transaction });
    }

    return wallet;
  }

  /**
   * Credits a user's wallet with ledger entry (within a DB transaction)
   */
  async creditWallet({ userId, amountPaise, referenceType, referenceId, description = '' }, transaction = null) {
    const parsedAmount = BigInt(amountPaise);
    if (parsedAmount <= 0n) {
      throw new Error('Credit amount must be greater than zero');
    }

    const executeCredit = async (tx) => {
      const wallet = await this.getOrCreateWallet(userId, tx);

      const currentBalance = BigInt(wallet.availableBalancePaise || 0);
      const newBalance = currentBalance + parsedAmount;
      const newLifetimeEarned = BigInt(wallet.lifetimeEarnedPaise || 0) + parsedAmount;

      await wallet.update({
        availableBalancePaise: newBalance,
        lifetimeEarnedPaise: newLifetimeEarned
      }, { transaction: tx });

      const txRecord = await WalletTransaction.create({
        walletId: wallet.id,
        userId,
        amountPaise: parsedAmount,
        transactionType: 'CREDIT_REWARD',
        status: 'SUCCESS',
        referenceType: referenceType || null,
        referenceId: referenceId ? String(referenceId) : null,
        balanceAfterPaise: newBalance,
        description: description || `Reward credit of ₹${(Number(parsedAmount) / 100).toFixed(2)}`
      }, { transaction: tx });

      logger.info(`Wallet credited: User ${userId}, Amount: ₹${Number(parsedAmount) / 100}, New Balance: ₹${Number(newBalance) / 100}`);
      return { wallet, transaction: txRecord };
    };

    if (transaction) {
      return executeCredit(transaction);
    }

    return sequelize.transaction(executeCredit);
  }

  /**
   * Debits a user's wallet with ledger entry (within a DB transaction)
   * Enforces that current available balance >= debit amount
   */
  async debitWallet({ userId, amountPaise, referenceType, referenceId, description = '' }, transaction = null) {
    const parsedAmount = BigInt(amountPaise);
    if (parsedAmount <= 0n) {
      throw new Error('Debit amount must be greater than zero');
    }

    const executeDebit = async (tx) => {
      const wallet = await this.getOrCreateWallet(userId, tx);

      const currentBalance = BigInt(wallet.availableBalancePaise || 0);
      if (currentBalance < parsedAmount) {
        const error = new Error(`Insufficient wallet balance. Available: ₹${(Number(currentBalance) / 100).toFixed(2)}, Requested: ₹${(Number(parsedAmount) / 100).toFixed(2)}`);
        error.statusCode = 400;
        throw error;
      }

      const newBalance = currentBalance - parsedAmount;
      const newLifetimeSpent = BigInt(wallet.lifetimeSpentPaise || 0) + parsedAmount;

      await wallet.update({
        availableBalancePaise: newBalance,
        lifetimeSpentPaise: newLifetimeSpent
      }, { transaction: tx });

      const txRecord = await WalletTransaction.create({
        walletId: wallet.id,
        userId,
        amountPaise: -parsedAmount, // Negative to represent debit
        transactionType: 'DEBIT_PURCHASE',
        status: 'SUCCESS',
        referenceType: referenceType || null,
        referenceId: referenceId ? String(referenceId) : null,
        balanceAfterPaise: newBalance,
        description: description || `Course credit redemption of ₹${(Number(parsedAmount) / 100).toFixed(2)}`
      }, { transaction: tx });

      logger.info(`Wallet debited: User ${userId}, Amount: ₹${Number(parsedAmount) / 100}, New Balance: ₹${Number(newBalance) / 100}`);
      return { wallet, transaction: txRecord };
    };

    if (transaction) {
      return executeDebit(transaction);
    }

    return sequelize.transaction(executeDebit);
  }

  /**
   * Reverses a previously issued reward credit (e.g. course refund)
   */
  async reverseCredit({ userId, amountPaise, referenceType = 'REWARD_REVERSAL', referenceId, description = '' }, transaction = null) {
    const parsedAmount = BigInt(amountPaise);
    if (parsedAmount <= 0n) return null;

    const executeReversal = async (tx) => {
      const wallet = await this.getOrCreateWallet(userId, tx);
      const currentBalance = BigInt(wallet.availableBalancePaise || 0);

      // Deduct from available balance (clamp to 0 if lower, or record deficit)
      const newBalance = currentBalance >= parsedAmount ? currentBalance - parsedAmount : 0n;

      await wallet.update({
        availableBalancePaise: newBalance
      }, { transaction: tx });

      const txRecord = await WalletTransaction.create({
        walletId: wallet.id,
        userId,
        amountPaise: -parsedAmount,
        transactionType: 'REVERSAL_REFUND',
        status: 'REVERSED',
        referenceType,
        referenceId: referenceId ? String(referenceId) : null,
        balanceAfterPaise: newBalance,
        description: description || `Reversal of ₹${(Number(parsedAmount) / 100).toFixed(2)}`
      }, { transaction: tx });

      logger.info(`Wallet credit reversed: User ${userId}, Amount: ₹${Number(parsedAmount) / 100}, Balance: ₹${Number(newBalance) / 100}`);
      return { wallet, transaction: txRecord };
    };

    if (transaction) {
      return executeReversal(transaction);
    }

    return sequelize.transaction(executeReversal);
  }

  /**
   * Gets wallet balance and summary formatted in Rupees and Paise
   */
  async getWalletSummary(userId) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      availableBalancePaise: Number(wallet.availableBalancePaise),
      availableBalanceRupees: Number(wallet.availableBalancePaise) / 100,
      pendingBalancePaise: Number(wallet.pendingBalancePaise),
      pendingBalanceRupees: Number(wallet.pendingBalancePaise) / 100,
      lifetimeEarnedPaise: Number(wallet.lifetimeEarnedPaise),
      lifetimeEarnedRupees: Number(wallet.lifetimeEarnedPaise) / 100,
      lifetimeSpentPaise: Number(wallet.lifetimeSpentPaise),
      lifetimeSpentRupees: Number(wallet.lifetimeSpentPaise) / 100
    };
  }

  /**
   * Retrieves paginated transaction history
   */
  async getWalletTransactions(userId, { page = 1, limit = 10, type = null } = {}) {
    const offset = (Math.max(1, page) - 1) * limit;
    const where = { userId };
    if (type) {
      where.transactionType = type;
    }

    const { count, rows } = await WalletTransaction.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      transactions: rows.map(t => ({
        id: t.id,
        amountPaise: Number(t.amountPaise),
        amountRupees: Number(t.amountPaise) / 100,
        transactionType: t.transactionType,
        status: t.status,
        referenceType: t.referenceType,
        referenceId: t.referenceId,
        balanceAfterRupees: Number(t.balanceAfterPaise) / 100,
        description: t.description,
        createdAt: t.createdAt
      }))
    };
  }
}

module.exports = new WalletService();

