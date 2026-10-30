const {
  User,
  ReferralCode,
  ReferralRelationship,
  ReferralTree,
  ReferralRewardLedger,
  sequelize
} = require('../../../models');
const referralGenerator = require('./referral.generator');
const logger = require('../../../utils/logger');
const { Op } = require('sequelize');

class ReferralService {
  /**
   * Ensures a user has a referral code generated, returning the active code
   */
  async getOrCreateReferralCode(user) {
    let codeRecord = await ReferralCode.findOne({ where: { userId: user.id } });
    if (!codeRecord) {
      const code = await referralGenerator.generateUniqueReferralCode(ReferralCode);
      codeRecord = await ReferralCode.create({
        userId: user.id,
        referralCode: code,
        isActive: true
      });
    }
    return codeRecord.referralCode;
  }

  /**
   * Generates public custom referral link for a user
   */
  async generateCustomReferralLink(user) {
    const referralCode = await this.getOrCreateReferralCode(user);
    const referralUrl = referralGenerator.buildReferralUrl(referralCode);
    return {
      referralCode,
      referralUrl
    };
  }

  /**
   * Resolves a referral code to the owning user
   */
  async resolveReferralCode(referralCode) {
    if (!referralCode) return null;
    const cleanCode = String(referralCode).trim().toUpperCase();
    const codeRecord = await ReferralCode.findOne({
      where: { referralCode: cleanCode, isActive: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'accountType'] }]
    });
    return codeRecord ? codeRecord.user : null;
  }

  /**
   * Validates and associates a new student to their referrer upon registration
   *
   * Business Rules:
   * - Cannot refer oneself (referrer_id != referred_user_id)
   * - Student can only have ONE direct referrer (immutable after registration)
   * - Prevent circular referrals (child cannot already be an ancestor of parent)
   * - Inserts direct link and transitive closure tree rows (depth 1 to 4)
   */
  async establishReferralRelationship({ referrerId, referredUserId, referralCode, attributionId = null }, transaction = null) {
    if (String(referrerId) === String(referredUserId)) {
      throw new Error('Self-referral is not permitted');
    }

    const executeLink = async (tx) => {
      // 1. Check if user is already referred (immutable direct parent rule)
      const existingParent = await ReferralRelationship.findOne({
        where: { referredUserId },
        transaction: tx
      });

      if (existingParent) {
        if (String(existingParent.referrerId) !== String(referrerId)) {
          throw new Error(`User ${referredUserId} already has a permanent referrer (${existingParent.referrerId}). Referrer cannot be changed.`);
        }
        logger.warn(`User ${referredUserId} already has a direct referrer (${existingParent.referrerId}). Referral immutable.`);
        return existingParent;
      }

      // 2. Prevent circular referral: Verify referredUserId is NOT already an ancestor of referrerId
      const circularCheck = await ReferralTree.findOne({
        where: {
          ancestorId: referredUserId,
          descendantId: referrerId
        },
        transaction: tx
      });

      if (circularCheck) {
        const error = new Error('Circular referral relationship detected and blocked');
        error.statusCode = 400;
        throw error;
      }

      // 3. Create the direct referral relationship
      const relationship = await ReferralRelationship.create({
        referrerId,
        referredUserId,
        referralCode: String(referralCode).trim().toUpperCase(),
        attributionId: attributionId || null,
        status: 'active',
        registeredAt: new Date()
      }, { transaction: tx });

      // 4. Update the Closure Tree (referral_tree)
      // Level 1: Direct link between referrer and referred user
      const treeRows = [
        {
          ancestorId: referrerId,
          descendantId: referredUserId,
          depth: 1
        }
      ];

      // Levels 2 to 4: Fetch all ancestors of referrerId with depth < 4
      const referrerAncestors = await ReferralTree.findAll({
        where: {
          descendantId: referrerId,
          depth: { [Op.lt]: 4 } // Only depths 1, 2, 3 so their child will be 2, 3, 4
        },
        transaction: tx
      });

      for (const ancestorRow of referrerAncestors) {
        treeRows.push({
          ancestorId: ancestorRow.ancestorId,
          descendantId: referredUserId,
          depth: ancestorRow.depth + 1
        });
      }

      await ReferralTree.bulkCreate(treeRows, { transaction: tx });

      logger.info(`Referral established: Parent ${referrerId} -> Child ${referredUserId} (Tree nodes created: ${treeRows.length})`);
      return relationship;
    };

    if (transaction) {
      return executeLink(transaction);
    }

    return sequelize.transaction(executeLink);
  }

  /**
   * Retrieves all eligible ancestors of a student up to 4 levels for commission payout
   * Returns array ordered by depth ASC: [{ ancestorId, depth: 1 }, { ancestorId, depth: 2 }, ...]
   */
  async getAncestorsForReward(userId, transaction = null) {
    const ancestors = await ReferralTree.findAll({
      where: {
        descendantId: userId,
        depth: { [Op.between]: [1, 4] }
      },
      order: [['depth', 'ASC']],
      transaction
    });

    return ancestors.map(a => ({
      ancestorId: a.ancestorId,
      depth: a.depth
    }));
  }

  /**
   * Retrieves direct referral history with pagination
   */
  async getDirectReferralHistory(userId, { page = 1, limit = 10 } = {}) {
    const offset = (Math.max(1, page) - 1) * limit;

    const { count, rows } = await ReferralRelationship.findAndCountAll({
      where: { referrerId: userId },
      include: [
        {
          model: User,
          as: 'referredUser',
          attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt']
        }
      ],
      limit,
      offset,
      order: [['registeredAt', 'DESC']]
    });

    return {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      referrals: rows.map(r => {
        const u = r.referredUser || {};
        return {
          id: r.id,
          userId: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Student',
          email: u.email ? this.maskEmail(u.email) : 'Hidden',
          registeredAt: r.registeredAt,
          status: r.status
        };
      })
    };
  }

  /**
   * Retrieves user's multi-level referral network breakdown and tree (Depths 1 to 4)
   */
  async getNetworkHierarchy(userId) {
    const treeRecords = await ReferralTree.findAll({
      where: {
        ancestorId: userId,
        depth: { [Op.lte]: 4 }
      },
      include: [
        {
          model: User,
          as: 'descendant',
          attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt']
        }
      ],
      order: [['depth', 'ASC'], ['createdAt', 'ASC']]
    });

    // Group by level
    const levels = {
      level1: [],
      level2: [],
      level3: [],
      level4: []
    };

    treeRecords.forEach(node => {
      const u = node.descendant;
      if (!u) return;

      const member = {
        userId: u.id,
        name: `${u.firstName || ''} ${(u.lastName || '').charAt(0)}.`.trim() || 'Student',
        email: this.maskEmail(u.email),
        joinedAt: u.createdAt,
        depth: node.depth
      };

      if (node.depth === 1) levels.level1.push(member);
      else if (node.depth === 2) levels.level2.push(member);
      else if (node.depth === 3) levels.level3.push(member);
      else if (node.depth === 4) levels.level4.push(member);
    });

    return {
      totalNetworkCount: treeRecords.length,
      level1Count: levels.level1.length,
      level2Count: levels.level2.length,
      level3Count: levels.level3.length,
      level4Count: levels.level4.length,
      network: levels
    };
  }

  /**
   * Helper to safely mask email address for peer privacy
   */
  maskEmail(email) {
    if (!email || !email.includes('@')) return '***@***.com';
    const [name, domain] = email.split('@');
    const maskedName = name.length > 2
      ? `${name.charAt(0)}***${name.charAt(name.length - 1)}`
      : `${name.charAt(0)}***`;
    return `${maskedName}@${domain}`;
  }
}

module.exports = new ReferralService();
