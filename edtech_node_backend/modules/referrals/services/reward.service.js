const {
  ReferralRewardRule,
  ReferralRewardLedger,
  ReferralRelationship,
  User,
  sequelize
} = require('../../../models');
const referralService = require('./referral.service');
const walletService = require('./wallet.service');
const logger = require('../../../utils/logger');
const { Op } = require('sequelize');

class RewardService {
  /**
   * Process one-time Unique Registration Reward for the direct referrer
   * Triggered when a new student completes eligible verified registration
   */
  async processRegistrationReward(referredUserId, transaction = null) {
    const execute = async (tx) => {
      // 1. Find direct referral relationship
      const relationship = await ReferralRelationship.findOne({
        where: { referredUserId },
        transaction: tx
      });

      if (!relationship) {
        logger.info(`Registration reward skipped: User ${referredUserId} was not referred by anyone`);
        return null;
      }

      const referrerId = relationship.referrerId;
      const idempotencyKey = `REG_REWARD_${referredUserId}`;

      // 2. Check if registration reward already awarded (Idempotency guarantee)
      const existingLedger = await ReferralRewardLedger.findOne({
        where: { idempotencyKey },
        transaction: tx
      });

      if (existingLedger) {
        logger.info(`Registration reward already processed for referred user ${referredUserId}`);
        return existingLedger;
      }

      // 3. Load active registration reward rule (Default: ₹20 = 2000 paise)
      const rule = await ReferralRewardRule.findOne({
        where: {
          rewardType: 'REGISTRATION',
          isActive: true
        },
        order: [['createdAt', 'DESC']],
        transaction: tx
      });

      const rewardAmountPaise = rule ? BigInt(rule.fixedAmountPaise) : 2000n; // Default ₹20

      if (rewardAmountPaise <= 0n) {
        logger.info('Registration reward is currently configured to 0 paise');
        return null;
      }

      // 4. Create Ledger Entry
      const ledgerEntry = await ReferralRewardLedger.create({
        userId: referrerId,
        referralId: relationship.id,
        orderId: null,
        rewardType: 'REGISTRATION',
        referralLevel: 1,
        amountPaise: rewardAmountPaise,
        currency: 'INR',
        status: 'AVAILABLE',
        idempotencyKey
      }, { transaction: tx });

      // 5. Credit Referrer Wallet
      await walletService.creditWallet({
        userId: referrerId,
        amountPaise: rewardAmountPaise,
        referenceType: 'REWARD_LEDGER',
        referenceId: String(ledgerEntry.id),
        description: `Referral registration bonus for inviting a verified student`
      }, tx);

      logger.info(`Registration reward processed: ₹${Number(rewardAmountPaise) / 100} credited to referrer ${referrerId}`);
      return ledgerEntry;
    };

    if (transaction) {
      return execute(transaction);
    }

    return sequelize.transaction(execute);
  }

  /**
   * Process multi-level course purchase commissions for ancestors up to Depth 4
   *
   * Commission Plan:
   * Level 1: Direct referrer = 10%
   * Level 2: Second-level ancestor = 5%
   * Level 3: Third-level ancestor = 2%
   * Level 4: Fourth-level ancestor = 1%
   */
  async processCoursePurchaseRewards({ purchaserId, orderId, paidAmountPaise, courseName = '' }, transaction = null) {
    if (process.env.ENABLE_MULTI_LEVEL_REWARDS === 'false') {
      logger.info('Multi-level reward system is currently disabled by feature flag');
      return { totalRewardsAwardedPaise: 0, totalRewardsAwardedRupees: 0, rewards: [] };
    }

    const cleanOrderId = String(orderId || 'PURCHASE').trim();
    const totalPaidPaise = BigInt(paidAmountPaise);

    if (totalPaidPaise <= 0n) {
      logger.info(`Course purchase reward skipped for order ${cleanOrderId}: zero or negative paid amount`);
      return { totalRewardsAwardedPaise: 0, rewards: [] };
    }

    const execute = async (tx) => {
      // 1. Get eligible ancestors (depth 1 to 4) from the Closure Tree
      const ancestors = await referralService.getAncestorsForReward(purchaserId, tx);
      if (!ancestors || ancestors.length === 0) {
        logger.info(`No eligible ancestors for purchaser ${purchaserId}`);
        return { totalRewardsAwardedPaise: 0, rewards: [] };
      }

      // 2. Load active reward rules for levels 1 to 4
      const rules = await ReferralRewardRule.findAll({
        where: {
          rewardType: 'COURSE_PURCHASE',
          level: { [Op.in]: [1, 2, 3, 4] },
          isActive: true
        },
        transaction: tx
      });

      // Default rates map: L1 = 10%, L2 = 5%, L3 = 2%, L4 = 1%
      const defaultRates = { 1: 10.0, 2: 5.0, 3: 2.0, 4: 1.0 };
      const rateMap = {};
      const maxCapMap = {};

      rules.forEach(r => {
        rateMap[r.level] = Number(r.rewardPercentage);
        if (r.maximumRewardPaise) {
          maxCapMap[r.level] = BigInt(r.maximumRewardPaise);
        }
      });

      const awardedRewards = [];
      let totalPayoutPaise = 0n;

      // 3. Distribute commission to each actual ancestor
      for (const ancestor of ancestors) {
        const depth = ancestor.depth;
        const ancestorId = ancestor.ancestorId;
        const percentage = rateMap[depth] !== undefined ? rateMap[depth] : defaultRates[depth] || 0;

        if (percentage <= 0) continue;

        // Mathematical calculation in integer minor units (paise)
        let commissionPaise = BigInt(Math.round((Number(totalPaidPaise) * percentage) / 100));

        // Enforce maximum reward cap if configured
        if (maxCapMap[depth] && commissionPaise > maxCapMap[depth]) {
          commissionPaise = maxCapMap[depth];
        }

        if (commissionPaise <= 0n) continue;

        const idempotencyKey = `PURCHASE_${cleanOrderId}_${ancestorId}_L${depth}`;

        // Check idempotency (prevent duplicate credit if webhook is redelivered)
        const existing = await ReferralRewardLedger.findOne({
          where: { idempotencyKey },
          transaction: tx
        });

        if (existing) {
          logger.info(`Commission already awarded for order ${cleanOrderId} to ancestor ${ancestorId}`);
          awardedRewards.push(existing);
          continue;
        }

        // Insert ledger entry
        const ledgerEntry = await ReferralRewardLedger.create({
          userId: ancestorId,
          referralId: null,
          orderId: cleanOrderId,
          rewardType: 'COURSE_PURCHASE',
          referralLevel: depth,
          amountPaise: commissionPaise,
          currency: 'INR',
          status: 'AVAILABLE',
          idempotencyKey
        }, { transaction: tx });

        // Credit ancestor wallet
        await walletService.creditWallet({
          userId: ancestorId,
          amountPaise: commissionPaise,
          referenceType: 'REWARD_LEDGER',
          referenceId: String(ledgerEntry.id),
          description: `Level ${depth} referral commission (${percentage}%) for course purchase${courseName ? `: ${courseName}` : ''}`
        }, tx);

        totalPayoutPaise += commissionPaise;
        awardedRewards.push(ledgerEntry);

        logger.info(`Commission awarded: Ancestor ${ancestorId} received ₹${Number(commissionPaise) / 100} (${percentage}% Level ${depth})`);
      }

      return {
        totalRewardsAwardedPaise: Number(totalPayoutPaise),
        totalRewardsAwardedRupees: Number(totalPayoutPaise) / 100,
        rewards: awardedRewards
      };
    };

    if (transaction) {
      return execute(transaction);
    }

    return sequelize.transaction(execute);
  }

  /**
   * Reverses rewards associated with a refunded order
   */
  async reverseOrderRewards({ orderId, reason = 'Course purchase refunded' }, transaction = null) {
    const cleanOrderId = String(orderId).trim();

    const execute = async (tx) => {
      const activeLedgers = await ReferralRewardLedger.findAll({
        where: {
          orderId: cleanOrderId,
          status: 'AVAILABLE'
        },
        transaction: tx
      });

      if (activeLedgers.length === 0) {
        logger.info(`No active reward ledgers found to reverse for order ${cleanOrderId}`);
        return [];
      }

      const reversedLedgers = [];
      for (const entry of activeLedgers) {
        // Mark entry as REVERSED
        await entry.update({ status: 'REVERSED' }, { transaction: tx });

        // Reverse wallet balance
        await walletService.reverseCredit({
          userId: entry.userId,
          amountPaise: entry.amountPaise,
          referenceType: 'REWARD_REVERSAL',
          referenceId: String(entry.id),
          description: `Reversal of Level ${entry.referralLevel || 1} commission: ${reason}`
        }, tx);

        reversedLedgers.push(entry);
      }

      logger.info(`Reversed ${reversedLedgers.length} reward ledgers for order ${cleanOrderId}`);
      return reversedLedgers;
    };

    if (transaction) {
      return execute(transaction);
    }

    return sequelize.transaction(execute);
  }

  /**
   * Retrieves level-wise earnings breakdown for a student
   */
  async getLevelEarningsBreakdown(userId) {
    const ledgers = await ReferralRewardLedger.findAll({
      where: {
        userId,
        status: { [Op.in]: ['AVAILABLE', 'USED'] }
      }
    });

    const breakdown = {
      registrationPaise: 0,
      registrationRupees: 0,
      level1Paise: 0,
      level1Rupees: 0,
      level2Paise: 0,
      level2Rupees: 0,
      level3Paise: 0,
      level3Rupees: 0,
      level4Paise: 0,
      level4Rupees: 0,
      totalEarnedPaise: 0,
      totalEarnedRupees: 0
    };

    ledgers.forEach(entry => {
      const amount = Number(entry.amountPaise);
      breakdown.totalEarnedPaise += amount;

      if (entry.rewardType === 'REGISTRATION') {
        breakdown.registrationPaise += amount;
      } else if (entry.referralLevel === 1) {
        breakdown.level1Paise += amount;
      } else if (entry.referralLevel === 2) {
        breakdown.level2Paise += amount;
      } else if (entry.referralLevel === 3) {
        breakdown.level3Paise += amount;
      } else if (entry.referralLevel === 4) {
        breakdown.level4Paise += amount;
      }
    });

    breakdown.registrationRupees = breakdown.registrationPaise / 100;
    breakdown.level1Rupees = breakdown.level1Paise / 100;
    breakdown.level2Rupees = breakdown.level2Paise / 100;
    breakdown.level3Rupees = breakdown.level3Paise / 100;
    breakdown.level4Rupees = breakdown.level4Paise / 100;
    breakdown.totalEarnedRupees = breakdown.totalEarnedPaise / 100;

    return breakdown;
  }

  /**
   * Retrieves paginated reward ledger history
   */
  async getRewardHistory(userId, { page = 1, limit = 10, status = null } = {}) {
    const offset = (Math.max(1, page) - 1) * limit;
    const where = { userId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await ReferralRewardLedger.findAndCountAll({
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
      rewards: rows.map(r => ({
        id: r.id,
        rewardType: r.rewardType,
        referralLevel: r.referralLevel,
        amountRupees: Number(r.amountPaise) / 100,
        amountPaise: Number(r.amountPaise),
        status: r.status,
        orderId: r.orderId,
        createdAt: r.createdAt
      }))
    };
  }
}

module.exports = new RewardService();

