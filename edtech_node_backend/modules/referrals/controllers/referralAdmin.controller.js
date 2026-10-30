const {
  User,
  ReferralRelationship,
  ReferralTree,
  ReferralRewardRule,
  ReferralRewardLedger,
  Wallet,
  WalletTransaction,
  sequelize
} = require('../../../models');
const referralService = require('../services/referral.service');
const walletService = require('../services/wallet.service');
const { Op } = require('sequelize');

const referralAdminController = {
  /**
   * Get overall system-wide referral and reward metrics
   */
  getOverview: async (req, res) => {
    try {
      const [
        totalReferrals,
        totalTreeLinks,
        activeRules,
        rewardSums
      ] = await Promise.all([
        ReferralRelationship.count(),
        ReferralTree.count(),
        ReferralRewardRule.findAll({ where: { isActive: true }, order: [['level', 'ASC']] }),
        ReferralRewardLedger.findAll({
          attributes: [
            'status',
            [sequelize.fn('SUM', sequelize.col('amount_paise')), 'totalAmountPaise'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['status'],
          raw: true
        })
      ]);

      let totalAwardedPaise = 0n;
      let totalAvailablePaise = 0n;
      let totalReversedPaise = 0n;

      rewardSums.forEach(r => {
        const sum = BigInt(r.totalAmountPaise || 0);
        if (r.status === 'AVAILABLE' || r.status === 'USED') {
          totalAwardedPaise += sum;
        }
        if (r.status === 'AVAILABLE') {
          totalAvailablePaise += sum;
        }
        if (r.status === 'REVERSED') {
          totalReversedPaise += sum;
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalRegisteredReferrals: totalReferrals,
            totalTreeConnections: totalTreeLinks,
            totalRewardsDistributedRupees: Number(totalAwardedPaise) / 100,
            activeLiabilityRupees: Number(totalAvailablePaise) / 100,
            totalReversalsRupees: Number(totalReversedPaise) / 100
          },
          activeRules: activeRules.map(r => ({
            id: r.id,
            rewardType: r.rewardType,
            level: r.level,
            rewardPercentage: Number(r.rewardPercentage),
            fixedAmountRupees: Number(r.fixedAmountPaise) / 100,
            maximumRewardRupees: r.maximumRewardPaise ? Number(r.maximumRewardPaise) / 100 : null,
            isActive: r.isActive
          }))
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Inspect any user's referral downline and upline network
   */
  getNetwork: async (req, res) => {
    try {
      const { userId, email } = req.query;
      let targetUser = null;

      if (userId) {
        targetUser = await User.findByPk(userId);
      } else if (email) {
        targetUser = await User.findOne({ where: { email: String(email).trim().toLowerCase() } });
      }

      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Fetch downline
      const downline = await referralService.getNetworkHierarchy(targetUser.id);

      // Fetch upline ancestors
      const uplineRecords = await ReferralTree.findAll({
        where: { descendantId: targetUser.id },
        include: [{ model: User, as: 'ancestor', attributes: ['id', 'firstName', 'lastName', 'email'] }],
        order: [['depth', 'ASC']]
      });

      const upline = uplineRecords.map(r => ({
        depth: r.depth,
        user: r.ancestor ? {
          id: r.ancestor.id,
          name: `${r.ancestor.firstName || ''} ${r.ancestor.lastName || ''}`.trim(),
          email: r.ancestor.email
        } : null
      }));

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: targetUser.id,
            name: `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim(),
            email: targetUser.email,
            accountType: targetUser.accountType
          },
          downline,
          upline
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Search and review reward ledger events
   */
  getRewards: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, rewardType, orderId, userId } = req.query;
      const offset = (Math.max(1, page) - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (rewardType) where.rewardType = rewardType;
      if (orderId) where.orderId = { [Op.iLike]: `%${orderId.trim()}%` };
      if (userId) where.userId = userId;

      const { count, rows } = await ReferralRewardLedger.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / limit),
          rewards: rows.map(r => ({
            id: r.id,
            user: r.user ? {
              id: r.user.id,
              name: `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim(),
              email: r.user.email
            } : null,
            rewardType: r.rewardType,
            referralLevel: r.referralLevel,
            amountRupees: Number(r.amountPaise) / 100,
            amountPaise: Number(r.amountPaise),
            status: r.status,
            orderId: r.orderId,
            idempotencyKey: r.idempotencyKey,
            createdAt: r.createdAt
          }))
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get all configurable reward rules
   */
  getRules: async (req, res) => {
    try {
      const rules = await ReferralRewardRule.findAll({
        order: [['rewardType', 'ASC'], ['level', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: rules.map(r => ({
          id: r.id,
          rewardType: r.rewardType,
          level: r.level,
          rewardPercentage: Number(r.rewardPercentage),
          fixedAmountRupees: Number(r.fixedAmountPaise) / 100,
          maximumRewardRupees: r.maximumRewardPaise ? Number(r.maximumRewardPaise) / 100 : null,
          isActive: r.isActive
        }))
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Update configurable commission and registration reward rules
   */
  updateRules: async (req, res) => {
    try {
      const { rules = [] } = req.body;
      if (!Array.isArray(rules) || rules.length === 0) {
        return res.status(400).json({ success: false, message: 'rules array is required' });
      }

      await sequelize.transaction(async (t) => {
        for (const item of rules) {
          const updates = {};
          if (item.rewardPercentage !== undefined) {
            updates.rewardPercentage = Number(item.rewardPercentage);
          }
          if (item.fixedAmountRupees !== undefined) {
            updates.fixedAmountPaise = BigInt(Math.round(Number(item.fixedAmountRupees) * 100));
          }
          if (item.maximumRewardRupees !== undefined) {
            updates.maximumRewardPaise = item.maximumRewardRupees !== null
              ? BigInt(Math.round(Number(item.maximumRewardRupees) * 100))
              : null;
          }
          if (item.isActive !== undefined) {
            updates.isActive = Boolean(item.isActive);
          }

          if (item.id) {
            await ReferralRewardRule.update(updates, { where: { id: item.id }, transaction: t });
          } else if (item.rewardType && item.level !== undefined) {
            await ReferralRewardRule.update(updates, {
              where: { rewardType: item.rewardType, level: item.level },
              transaction: t
            });
          }
        }
      });

      const updatedRules = await ReferralRewardRule.findAll({
        order: [['rewardType', 'ASC'], ['level', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Reward rules updated successfully',
        data: updatedRules
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get all wallet transactions (audit log)
   */
  getTransactions: async (req, res) => {
    try {
      const { page = 1, limit = 20, type, userId } = req.query;
      const offset = (Math.max(1, page) - 1) * limit;

      const where = {};
      if (type) where.transactionType = type;
      if (userId) where.userId = userId;

      const { count, rows } = await WalletTransaction.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / limit),
          transactions: rows.map(t => ({
            id: t.id,
            user: t.user ? {
              id: t.user.id,
              name: `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim(),
              email: t.user.email
            } : null,
            amountRupees: Number(t.amountPaise) / 100,
            transactionType: t.transactionType,
            status: t.status,
            referenceType: t.referenceType,
            referenceId: t.referenceId,
            balanceAfterRupees: Number(t.balanceAfterPaise) / 100,
            description: t.description,
            createdAt: t.createdAt
          }))
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Administrative ledger adjustment with mandatory audit logging
   */
  auditOverride: async (req, res) => {
    try {
      const { userId, amountRupees, direction = 'CREDIT', reason } = req.body;

      if (!userId || !amountRupees || !reason) {
        return res.status(400).json({ success: false, message: 'userId, amountRupees, and reason are required' });
      }

      const paise = Math.round(Number(amountRupees) * 100);
      if (paise <= 0) {
        return res.status(400).json({ success: false, message: 'amountRupees must be positive' });
      }

      let result;
      if (direction === 'CREDIT') {
        result = await walletService.creditWallet({
          userId,
          amountPaise: BigInt(paise),
          referenceType: 'ADMIN_OVERRIDE',
          referenceId: `ADMIN_${req.user.id}_${Date.now()}`,
          description: `Admin credit override by ${req.user.email}: ${reason}`
        });
      } else {
        result = await walletService.debitWallet({
          userId,
          amountPaise: BigInt(paise),
          referenceType: 'ADMIN_OVERRIDE',
          referenceId: `ADMIN_${req.user.id}_${Date.now()}`,
          description: `Admin debit override by ${req.user.email}: ${reason}`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Admin wallet adjustment recorded with audit log',
        data: result
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
};

module.exports = referralAdminController;

