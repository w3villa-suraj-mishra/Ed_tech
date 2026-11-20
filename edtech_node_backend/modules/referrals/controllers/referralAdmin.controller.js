const {
  User,
  ReferralRelationship,
  ReferralTree,
  ReferralRewardRule,
  ReferralRewardLedger,
  Enrollment,
  Course,
  Wallet,
  WalletTransaction,
  sequelize
} = require('../../../models');
const referralService = require('../services/referral.service');
const walletService = require('../services/wallet.service');
const { buildNetworkUserSearch } = require('../utils/networkSearch');
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
        rewardSums,
        activeReferrersCount,
        topReferrerRows,
        recentReferralRows,
        earnedRows,
        earnedDetailsRows
      ] = await Promise.all([
        ReferralRelationship.count(),
        ReferralTree.count(),
        ReferralRewardRule.findAll({ where: { isActive: true }, order: [['level', 'ASC']] }),
        ReferralRewardLedger.findAll({
          attributes: [
            'status',
            [sequelize.fn('SUM', sequelize.col('amount_paise')), 'totalAmountPaise']
          ],
          group: ['status'],
          raw: true
        }),
        ReferralRelationship.count({ distinct: true, col: 'referrerId' }),
        ReferralRelationship.findAll({
          include: [{ model: User, as: 'referrer', attributes: ['id', 'firstName', 'lastName', 'email'] }],
          order: [['registeredAt', 'DESC']]
        }),
        ReferralRelationship.findAll({
          include: [
            { model: User, as: 'referrer', attributes: ['id', 'firstName', 'lastName', 'email'] },
            { model: User, as: 'referredUser', attributes: ['id', 'firstName', 'lastName', 'email'] }
          ],
          order: [['registeredAt', 'DESC']],
          limit: 10
        }),
        ReferralRewardLedger.findAll({
          attributes: [
            'userId',
            [sequelize.fn('SUM', sequelize.col('amount_paise')), 'totalEarnedPaise']
          ],
          group: ['userId'],
          raw: true
        }),
        ReferralRewardLedger.findAll({
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ],
          order: [['createdAt', 'DESC']]
        })
      ]);

      let totalAwardedPaise = 0n;
      let totalAvailablePaise = 0n;
      let totalReversedPaise = 0n;

      rewardSums.forEach((row) => {
        const sum = BigInt(row.totalAmountPaise || 0);
        if (row.status === 'AVAILABLE' || row.status === 'USED') totalAwardedPaise += sum;
        if (row.status === 'AVAILABLE') totalAvailablePaise += sum;
        if (row.status === 'REVERSED') totalReversedPaise += sum;
      });

      const earnedByUser = new Map();
      earnedRows.forEach((row) => {
        earnedByUser.set(String(row.userId), BigInt(row.totalEarnedPaise || 0));
      });

      const earningsDetailsByUser = new Map();
      for (const ledgerEntry of earnedDetailsRows) {
        const key = String(ledgerEntry.userId);
        const details = earningsDetailsByUser.get(key) || [];
        let purchaserName = '';
        let courseName = '';

        if (ledgerEntry.rewardType === 'COURSE_PURCHASE' && ledgerEntry.orderId) {
          const enrollment = await Enrollment.findOne({
            where: { paymentReference: ledgerEntry.orderId },
            include: [
              { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
              { model: Course, as: 'course', attributes: ['id', 'courseName'] }
            ],
            order: [['createdAt', 'DESC']]
          });
          purchaserName = enrollment?.user
            ? `${enrollment.user.firstName || ''} ${enrollment.user.lastName || ''}`.trim()
            : '';
          courseName = enrollment?.course?.courseName || '';
        }

        let sourceName = 'Referral reward';
        if (ledgerEntry.rewardType === 'REGISTRATION') {
          const relationship = ledgerEntry.referralId
            ? await ReferralRelationship.findByPk(ledgerEntry.referralId, {
                include: [{ model: User, as: 'referredUser', attributes: ['id', 'firstName', 'lastName', 'email'] }]
              })
            : null;
          purchaserName = relationship?.referredUser
            ? `${relationship.referredUser.firstName || ''} ${relationship.referredUser.lastName || ''}`.trim()
            : '';
          sourceName = purchaserName ? `Used referral code · Referred by ${purchaserName}` : 'Used referral code';
        } else if (ledgerEntry.rewardType === 'COURSE_PURCHASE') {
          sourceName = purchaserName
            ? `Course bought by ${purchaserName}${courseName ? ` · ${courseName}` : ''}`
            : `Course purchase · ${ledgerEntry.orderId || 'Order'}`;
        }

        details.push({
          id: ledgerEntry.id,
          rewardType: ledgerEntry.rewardType,
          referralLevel: ledgerEntry.referralLevel,
          amountRupees: Number(ledgerEntry.amountPaise) / 100,
          status: ledgerEntry.status,
          orderId: ledgerEntry.orderId,
          purchaserName,
          courseName,
          createdAt: ledgerEntry.createdAt,
          sourceName
        });
        earningsDetailsByUser.set(key, details);
      }

      const referrerTotals = new Map();
      topReferrerRows.forEach((row) => {
        const referrer = row.referrer;
        const key = String(row.referrerId);
        const current = referrerTotals.get(key) || {
          userId: referrer?.id || row.referrerId,
          name: `${referrer?.firstName || ''} ${referrer?.lastName || ''}`.trim(),
          email: referrer?.email || '',
          referralCount: 0,
          totalEarnedRupees: 0
        };
        current.referralCount += 1;
        referrerTotals.set(key, current);
      });

      const topReferrers = Array.from(referrerTotals.values())
        .map((referrer) => ({
          ...referrer,
          totalEarnedRupees: Number(earnedByUser.get(String(referrer.userId)) || 0n) / 100,
          earnings: earningsDetailsByUser.get(String(referrer.userId)) || []
        }))
        .sort((a, b) => b.referralCount - a.referralCount)
        .slice(0, 10);

      const recentReferrals = recentReferralRows.map((row) => {
        const referred = row.referredUser;
        const referrer = row.referrer;
        return {
          referrerId: row.referrerId,
          referrerName: `${referrer?.firstName || ''} ${referrer?.lastName || ''}`.trim(),
          referredUserId: row.referredUserId,
          referredName: `${referred?.firstName || ''} ${referred?.lastName || ''}`.trim(),
          referredEmail: referred?.email || '',
          referralCode: row.referralCode,
          registeredAt: row.registeredAt
        };
      });

      const overview = {
        totalReferrals,
        activeReferrersCount,
        totalCommissionsPaidRupees: Number(totalAwardedPaise) / 100,
        topReferrers,
        recentReferrals,
        metrics: {
          totalRegisteredReferrals: totalReferrals,
          totalTreeConnections: totalTreeLinks,
          totalRewardsDistributedRupees: Number(totalAwardedPaise) / 100,
          activeLiabilityRupees: Number(totalAvailablePaise) / 100,
          totalReversalsRupees: Number(totalReversedPaise) / 100,
          activeReferrersCount
        },
        activeRules: activeRules.map((rule) => ({
          id: rule.id,
          rewardType: rule.rewardType,
          level: rule.level,
          rewardPercentage: Number(rule.rewardPercentage),
          fixedAmountRupees: Number(rule.fixedAmountPaise) / 100,
          maximumRewardRupees: rule.maximumRewardPaise ? Number(rule.maximumRewardPaise) / 100 : null,
          isActive: rule.isActive
        })),
        perUserEarnings: Array.from(earnedByUser.entries()).map(([userId, totalPaise]) => ({
          userId,
          totalEarnedRupees: Number(totalPaise) / 100
        })),
        earnedDetails: earnedDetailsRows.map(r => ({
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
      };

      return res.status(200).json({ success: true, data: overview });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Inspect any user's referral downline and upline network
   */
  getNetwork: async (req, res) => {
    try {
      const { userId, email, studentId, q } = req.query;
      const rawSearch = userId || email || studentId || q;
      const search = buildNetworkUserSearch(rawSearch);

      let targetUser = null;

      if (search) {
        if (search.type === 'id') {
          targetUser = await User.findByPk(search.where.id);
        } else {
          targetUser = await User.findOne({
            where: search.where,
            order: [['createdAt', 'DESC']]
          });
        }
      }

      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const downlineHierarchy = await referralService.getNetworkHierarchy(targetUser.id);
      const downlines = (downlineHierarchy.network && Array.isArray(downlineHierarchy.network.level1) ? [
        ...downlineHierarchy.network.level1,
        ...downlineHierarchy.network.level2,
        ...downlineHierarchy.network.level3,
        ...downlineHierarchy.network.level4
      ] : []).map(item => ({
        id: item.userId,
        name: item.name || 'Student',
        email: item.email || '',
        registeredAt: item.joinedAt,
        depth: item.depth
      }));

      const uplineRecords = await ReferralTree.findAll({
        where: { descendantId: targetUser.id },
        include: [{ model: User, as: 'ancestor', attributes: ['id', 'firstName', 'lastName', 'email'] }],
        order: [['depth', 'ASC']]
      });

      const ancestors = uplineRecords.map(r => ({
        depth: r.depth,
        id: r.ancestor?.id || null,
        name: r.ancestor ? `${r.ancestor.firstName || ''} ${r.ancestor.lastName || ''}`.trim() || 'Parent' : 'Unknown',
        email: r.ancestor?.email || '',
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
          downlines,
          ancestors,
          network: {
            downlines,
            ancestors
          },
          upline: ancestors,
          downline: downlineHierarchy
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Search and review reward ledger events with complete referral relationship details
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
          },
          {
            model: ReferralRelationship,
            as: 'referral',
            attributes: ['id', 'referrerId', 'referredUserId', 'referralCode']
          }
        ],
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      // Collect all unique user IDs from reward rows
      const userIds = [...new Set(rows.map(r => r.userId))];

      // Batch-fetch referral relationships where the user is the referred child
      // (i.e. someone referred them — this tells us their parent)
      const childRelationships = userIds.length > 0
        ? await ReferralRelationship.findAll({
            where: { referredUserId: { [Op.in]: userIds } },
            include: [
              { model: User, as: 'referrer', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ]
          })
        : [];

      // Map: referredUserId -> { referrer (parent), referralCode }
      const parentByUserId = new Map();
      childRelationships.forEach(rel => {
        parentByUserId.set(rel.referredUserId, rel);
      });

      // Batch-fetch direct children for each user (where the user is the referrer)
      const parentRelationships = userIds.length > 0
        ? await ReferralRelationship.findAll({
            where: { referrerId: { [Op.in]: userIds } },
            include: [
              { model: User, as: 'referredUser', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ]
          })
        : [];

      // Map: referrerId -> [children]
      const childrenByUserId = new Map();
      parentRelationships.forEach(rel => {
        const list = childrenByUserId.get(rel.referrerId) || [];
        list.push(rel);
        childrenByUserId.set(rel.referrerId, list);
      });

      // Collect parent user IDs to look up grandparents
      const parentUserIds = [...new Set(
        childRelationships.map(rel => rel.referrerId).filter(Boolean)
      )];

      // Fetch parent-of-parent relationships (grandparent lookup for CHILD users)
      const grandparentRelationships = parentUserIds.length > 0
        ? await ReferralRelationship.findAll({
            where: { referredUserId: { [Op.in]: parentUserIds } },
            include: [
              { model: User, as: 'referrer', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ]
          })
        : [];

      // Map: parentUserId -> their parent (grandparent of the original user)
      const grandparentByParentId = new Map();
      grandparentRelationships.forEach(rel => {
        grandparentByParentId.set(rel.referredUserId, rel);
      });

      // For grandparent role detection: collect all child IDs of current users,
      // then check which of those children are themselves referrers
      const allChildIds = [...new Set(
        parentRelationships.map(rel => rel.referredUserId)
      )];
      const grandchildCounts = allChildIds.length > 0
        ? await ReferralRelationship.findAll({
            where: { referrerId: { [Op.in]: allChildIds } },
            attributes: ['referrerId'],
            group: ['referrerId'],
            raw: true
          })
        : [];
      // Set of child IDs that are themselves parents (making the original user a grandparent)
      const childIdsWithChildren = new Set(grandchildCounts.map(r => r.referrerId));

      // Helper: format user object
      const formatUser = (user) => {
        if (!user) return null;
        return {
          id: String(user.id),
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email
        };
      };

      // Build enriched rewards
      const rewards = rows.map(r => {
        const uid = r.userId;
        const hasChildren = childrenByUserId.has(uid) && childrenByUserId.get(uid).length > 0;
        const parentRel = parentByUserId.get(uid); // relationship where this user is the child
        const isChild = !!parentRel;

        // Determine role
        let role;
        if (isChild) {
          role = 'CHILD';
        } else if (hasChildren) {
          role = 'PARENT';
        } else {
          role = 'PARENT'; // user with no parent and no children defaults to PARENT
        }

        // Check if this user is a grandparent (any of their children have their own children)
        if (hasChildren) {
          const children = childrenByUserId.get(uid);
          const isGrandparent = children.some(childRel =>
            childIdsWithChildren.has(childRel.referredUserId)
          );
          if (isGrandparent) {
            role = 'GRANDPARENT';
          }
        }

        // Build referralDetails
        let referralDetails = null;
        if (role === 'CHILD') {
          const parentUser = parentRel.referrer;
          const grandparentRel = grandparentByParentId.get(parentRel.referrerId);

          referralDetails = {
            usedReferralCode: parentRel.referralCode || null,
            parent: formatUser(parentUser),
            grandparent: grandparentRel ? formatUser(grandparentRel.referrer) : null
          };
        } else if (role === 'PARENT' || role === 'GRANDPARENT') {
          const children = (childrenByUserId.get(uid) || []).map(rel => formatUser(rel.referredUser));
          referralDetails = {
            children
          };

          // If this user is also a child of someone, include upline info
          if (isChild) {
            const parentUser = parentRel.referrer;
            const grandparentRel = grandparentByParentId.get(parentRel.referrerId);
            referralDetails.usedReferralCode = parentRel.referralCode || null;
            referralDetails.parent = formatUser(parentUser);
            referralDetails.grandparent = grandparentRel ? formatUser(grandparentRel.referrer) : null;
          }
        }

        return {
          id: r.id,
          user: r.user ? {
            id: String(r.user.id),
            name: `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim(),
            email: r.user.email,
            role
          } : null,
          referralDetails,
          rewardType: r.rewardType,
          referralLevel: r.referralLevel,
          amountRupees: Number(r.amountPaise) / 100,
          amountPaise: Number(r.amountPaise),
          status: r.status,
          orderId: r.orderId,
          idempotencyKey: r.idempotencyKey,
          createdAt: r.createdAt
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / limit),
          rewards
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

