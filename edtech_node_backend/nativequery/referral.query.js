const sequelize = require('../config/database');
const { Op } = require('sequelize');
const {
  User,
  ReferralRelationship,
  ReferralTree,
  ReferralRewardRule,
  ReferralRewardLedger,
  ReferralCode,
  ReferralAttribution,
  Enrollment,
  Course,
  Wallet,
  WalletTransaction
} = require('../models');

/**
 * Referral System Native Queries Layer
 * All referral queries executed here instead of controllers.
 */

/**
 * Find direct parent referrer relation for a referred user
 */
const findDirectParentRelationQuery = async (referredUserId) => {
  return await ReferralRelationship.findOne({
    where: { referredUserId },
    include: [{ model: User, as: 'referrer', attributes: ['id', 'firstName', 'lastName', 'email'] }]
  });
};

/**
 * Count total referral relationships
 */
const countReferralRelationshipsQuery = async (options = {}) => {
  return await ReferralRelationship.count(options);
};

/**
 * Count total referral tree connections
 */
const countReferralTreesQuery = async (options = {}) => {
  return await ReferralTree.count(options);
};

/**
 * Get active reward rules ordered by level ascending
 */
const getActiveRewardRulesQuery = async () => {
  return await ReferralRewardRule.findAll({
    where: { isActive: true },
    order: [['level', 'ASC']]
  });
};

/**
 * Get reward ledger sums grouped by status
 */
const getRewardSumsByStatusQuery = async () => {
  return await ReferralRewardLedger.findAll({
    attributes: [
      'status',
      [sequelize.fn('SUM', sequelize.col('amount_paise')), 'totalAmountPaise']
    ],
    group: ['status'],
    raw: true
  });
};

/**
 * Count distinct active referrers
 */
const countDistinctReferrersQuery = async () => {
  return await ReferralRelationship.count({ distinct: true, col: 'referrerId' });
};

/**
 * Get all referral relationships for overview with referrer details
 */
const getAllReferralRelationshipsForOverviewQuery = async () => {
  return await ReferralRelationship.findAll({
    include: [{ model: User, as: 'referrer', attributes: ['id', 'firstName', 'lastName', 'email'] }],
    order: [['registeredAt', 'DESC']]
  });
};

/**
 * Get recent referral rows with both referrer and referred user details
 */
const getRecentReferralRowsQuery = async (limit = 10) => {
  return await ReferralRelationship.findAll({
    include: [
      { model: User, as: 'referrer', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: User, as: 'referredUser', attributes: ['id', 'firstName', 'lastName', 'email'] }
    ],
    order: [['registeredAt', 'DESC']],
    limit: Number(limit)
  });
};

/**
 * Get total earned sums per user from reward ledger
 */
const getUserEarnedSumsQuery = async () => {
  return await ReferralRewardLedger.findAll({
    attributes: [
      'userId',
      [sequelize.fn('SUM', sequelize.col('amount_paise')), 'totalEarnedPaise']
    ],
    group: ['userId'],
    raw: true
  });
};

/**
 * Get reward ledger entries with user details
 */
const getEarnedDetailsWithUserQuery = async () => {
  return await ReferralRewardLedger.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

/**
 * Find enrollment by payment reference with user and course
 */
const findEnrollmentByPaymentReferenceQuery = async (paymentReference) => {
  return await Enrollment.findOne({
    where: { paymentReference },
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Course, as: 'course', attributes: ['id', 'courseName'] }
    ],
    order: [['createdAt', 'DESC']]
  });
};

/**
 * Find referral relationship with referred user details by PK
 */
const findReferralWithReferredUserByIdQuery = async (id) => {
  return await ReferralRelationship.findByPk(id, {
    include: [{ model: User, as: 'referredUser', attributes: ['id', 'firstName', 'lastName', 'email'] }]
  });
};

/**
 * Batch fetch initial overview data
 */
const getReferralOverviewDataQuery = async () => {
  return await Promise.all([
    countReferralRelationshipsQuery(),
    countReferralTreesQuery(),
    getActiveRewardRulesQuery(),
    getRewardSumsByStatusQuery(),
    countDistinctReferrersQuery(),
    getAllReferralRelationshipsForOverviewQuery(),
    getRecentReferralRowsQuery(10),
    getUserEarnedSumsQuery(),
    getEarnedDetailsWithUserQuery()
  ]);
};

/**
 * Find target user for network inspection (by id or criteria)
 */
const findNetworkTargetUserQuery = async (search) => {
  if (!search) return null;
  if (search.type === 'id') {
    return await User.findByPk(search.where.id);
  }
  return await User.findOne({
    where: search.where,
    order: [['createdAt', 'DESC']]
  });
};

/**
 * Find upline records from referral tree for a descendant user
 */
const findUplineRecordsQuery = async (descendantId) => {
  return await ReferralTree.findAll({
    where: { descendantId },
    include: [{ model: User, as: 'ancestor', attributes: ['id', 'firstName', 'lastName', 'email'] }],
    order: [['depth', 'ASC']]
  });
};

/**
 * Paginated reward ledger query with user and referral relation
 */
const findAndCountRewardsLedgerQuery = async ({ where = {}, status, rewardType, orderId, userId, limit = 20, offset = 0 } = {}) => {
  const queryWhere = { ...where };
  if (status) queryWhere.status = status;
  if (rewardType) queryWhere.rewardType = rewardType;
  if (orderId && typeof orderId === 'string') {
    queryWhere.orderId = { [Op.iLike]: `%${orderId.trim()}%` };
  }
  if (userId) queryWhere.userId = userId;

  return await ReferralRewardLedger.findAndCountAll({
    where: queryWhere,
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
    offset: Number(offset),
    order: [['createdAt', 'DESC']]
  });
};

/**
 * Find child relationships where the users are referred children
 */
const findChildRelationshipsByUserIdsQuery = async (userIds) => {
  if (!userIds || userIds.length === 0) return [];
  return await ReferralRelationship.findAll({
    where: { referredUserId: { [Op.in]: userIds } },
    include: [
      { model: User, as: 'referrer', attributes: ['id', 'firstName', 'lastName', 'email'] }
    ]
  });
};

/**
 * Find parent relationships where the users are referrers (direct parents)
 */
const findParentRelationshipsByUserIdsQuery = async (userIds) => {
  if (!userIds || userIds.length === 0) return [];
  return await ReferralRelationship.findAll({
    where: { referrerId: { [Op.in]: userIds } },
    include: [
      { model: User, as: 'referredUser', attributes: ['id', 'firstName', 'lastName', 'email'] }
    ]
  });
};

/**
 * Find grandparent relationships by parent IDs
 */
const findGrandparentRelationshipsByParentIdsQuery = async (parentUserIds) => {
  if (!parentUserIds || parentUserIds.length === 0) return [];
  return await ReferralRelationship.findAll({
    where: { referredUserId: { [Op.in]: parentUserIds } },
    include: [
      { model: User, as: 'referrer', attributes: ['id', 'firstName', 'lastName', 'email'] }
    ]
  });
};

/**
 * Find grandchild counts for child IDs
 */
const findGrandchildCountsQuery = async (childIds) => {
  if (!childIds || childIds.length === 0) return [];
  return await ReferralRelationship.findAll({
    where: { referrerId: { [Op.in]: childIds } },
    attributes: ['referrerId'],
    group: ['referrerId'],
    raw: true
  });
};

/**
 * Get all reward rules
 */
const getAllRewardRulesQuery = async () => {
  return await ReferralRewardRule.findAll({
    order: [['rewardType', 'ASC'], ['level', 'ASC']]
  });
};

/**
 * Update reward rules in a transaction
 */
const updateRewardRulesBatchQuery = async (rules) => {
  return await sequelize.transaction(async (t) => {
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
};

/**
 * Find and count wallet transactions
 */
const findAndCountWalletTransactionsQuery = async ({ where = {}, type, transactionType, userId, limit = 20, offset = 0 } = {}) => {
  const queryWhere = { ...where };
  const txType = type || transactionType;
  if (txType) queryWhere.transactionType = txType;
  if (userId) queryWhere.userId = userId;

  return await WalletTransaction.findAndCountAll({
    where: queryWhere,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [['createdAt', 'DESC']]
  });
};

/**
 * Find referral code record by clean uppercase code
 */
const findReferralCodeByCodeQuery = async (code) => {
  return await ReferralCode.findOne({
    where: { code: String(code).trim().toUpperCase() },
    include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'accountType'] }]
  });
};

/**
 * Find referral relationship by where clause
 */
const findReferralRelationshipQuery = async (where) => {
  return await ReferralRelationship.findOne({ where });
};

/**
 * Find wallet by user id
 */
const findWalletByUserIdQuery = async (userId) => {
  return await Wallet.findOne({ where: { userId } });
};

module.exports = {
  findDirectParentRelationQuery,
  countReferralRelationshipsQuery,
  countReferralTreesQuery,
  getActiveRewardRulesQuery,
  getRewardSumsByStatusQuery,
  countDistinctReferrersQuery,
  getAllReferralRelationshipsForOverviewQuery,
  getRecentReferralRowsQuery,
  getUserEarnedSumsQuery,
  getEarnedDetailsWithUserQuery,
  findEnrollmentByPaymentReferenceQuery,
  findReferralWithReferredUserByIdQuery,
  getReferralOverviewDataQuery,
  findNetworkTargetUserQuery,
  findUplineRecordsQuery,
  findAndCountRewardsLedgerQuery,
  findChildRelationshipsByUserIdsQuery,
  findParentRelationshipsByUserIdsQuery,
  findGrandparentRelationshipsByParentIdsQuery,
  findGrandchildCountsQuery,
  getAllRewardRulesQuery,
  updateRewardRulesBatchQuery,
  findAndCountWalletTransactionsQuery,
  findReferralCodeByCodeQuery,
  findReferralRelationshipQuery,
  findWalletByUserIdQuery
};
