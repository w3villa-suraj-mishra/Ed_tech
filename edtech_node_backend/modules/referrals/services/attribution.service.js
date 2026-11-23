const crypto = require('crypto');
const { ReferralAttribution, ReferralCode, ReferralRelationship, User, sequelize } = require('../../../models');
const logger = require('../../../utils/logger');
const { Op } = require('sequelize');

class AttributionService {
  /**
   * Normalizes an email address consistently
   */
  normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  /**
   * Securely generates an HMAC-SHA256 identity key for the given email
   */
  generateIdentityHash(email) {
    const normalized = this.normalizeEmail(email);
    if (!normalized) return null;
    const secret = process.env.REFERRAL_IDENTITY_SECRET || process.env.JWT_SECRET || 'edtech_referral_identity_secret';
    return crypto.createHmac('sha256', secret).update(normalized).digest('hex');
  }

  /**
   * Captures incoming referral attribution click or visit
   * Adheres to First-Touch attribution:
   * If an email identity was previously attributed, subsequent links do not overwrite it.
   */
  async captureAttribution({ anonymousId, referralCode, email = null, channel = 'web', landingPage = '/register', campaign = 'referral' }) {
    if (!referralCode || typeof referralCode !== 'string') {
      const error = new Error('Referral code is required for attribution capture');
      error.statusCode = 400;
      throw error;
    }

    const cleanCode = referralCode.trim().toUpperCase();

    // Verify referral code exists and is active
    const codeRecord = await ReferralCode.findOne({
      where: { referralCode: cleanCode, isActive: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'active'] }]
    });

    if (!codeRecord) {
      const error = new Error('Invalid or inactive referral code');
      error.statusCode = 404;
      throw error;
    }

    const anonId = anonymousId || `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // If an email is provided (or known), check first-touch policy
    if (email) {
      const identityHash = this.generateIdentityHash(email);
      const existing = await ReferralAttribution.findOne({
        where: { referredIdentityHash: identityHash },
        order: [['originalAttributedAt', 'ASC']]
      });

      if (existing) {
        logger.info(`First-touch attribution preserved for identity ${identityHash} (Original Referrer: ${existing.referrerUserId})`);
        return {
          attributionId: existing.id,
          anonymousId: anonId,
          referralCode: existing.referralCode,
          firstTouchPreserved: true,
          referrerName: codeRecord.user?.firstName ? `${codeRecord.user.firstName} ${codeRecord.user.lastName || ''}`.trim() : 'EdTech Learner',
          landingPage: existing.landingPage || landingPage
        };
      }

      // Check self-referral
      if (codeRecord.user && this.normalizeEmail(codeRecord.user.email) === this.normalizeEmail(email)) {
        const error = new Error('Self-referral is not permitted');
        error.statusCode = 400;
        throw error;
      }

      // Create new attribution for this identity
      const attribution = await ReferralAttribution.create({
        referredIdentityHash: identityHash,
        referrerUserId: codeRecord.userId,
        referralCode: cleanCode,
        originalAttributedAt: new Date(),
        anonymousId: anonId,
        channel: String(channel || 'web').toLowerCase(),
        landingPage: String(landingPage || '/register'),
        campaign: String(campaign || 'referral'),
        status: 'attributed'
      });

      return {
        attributionId: attribution.id,
        anonymousId: anonId,
        referralCode: cleanCode,
        referrerName: codeRecord.user?.firstName ? `${codeRecord.user.firstName} ${codeRecord.user.lastName || ''}`.trim() : 'EdTech Learner',
        landingPage: attribution.landingPage
      };
    }

    // Anonymous visitor touchpoint
    const attribution = await ReferralAttribution.create({
      referrerUserId: codeRecord.userId,
      referralCode: cleanCode,
      originalAttributedAt: new Date(),
      anonymousId: anonId,
      channel: String(channel || 'web').toLowerCase(),
      landingPage: String(landingPage || '/register'),
      campaign: String(campaign || 'referral'),
      status: 'pending'
    });

    logger.info(`Referral attribution captured: Code ${cleanCode}, AnonId: ${anonId}, Channel: ${channel}`);

    return {
      attributionId: attribution.id,
      anonymousId: anonId,
      referralCode: cleanCode,
      referrerName: codeRecord.user?.firstName ? `${codeRecord.user.firstName} ${codeRecord.user.lastName || ''}`.trim() : 'EdTech Learner',
      landingPage: attribution.landingPage
    };
  }

  /**
   * Finds persistent attribution by email or identity hash
   */
  async findAttributionByIdentity(identityHash) {
    if (!identityHash) return null;
    return await ReferralAttribution.findOne({
      where: { referredIdentityHash: identityHash },
      order: [['originalAttributedAt', 'ASC']]
    });
  }

  /**
   * Main attribution pipeline called during User Registration & Re-registration
   *
   * Business Rules:
   * 1. Persistent Attribution: Matches normalized email HMAC identity hash.
   * 2. Re-Registration: If user deleted account and registers again with the same email,
   *    restores the original referrer without creating duplicate attributions.
   * 3. First-Touch Policy: Original referrer is never overwritten by subsequent referral codes.
   * 4. Self-Referral: Blocked if referrer is the user themselves.
   * 5. Re-establishes direct relationship and closure tree.
   */
  async attributeOnRegistration({ email, userId, incomingReferralCode = null, anonymousId = null, attributionId = null }, transaction = null) {
    if (!email || !userId) return null;

    const normalizedEmail = this.normalizeEmail(email);
    const identityHash = this.generateIdentityHash(normalizedEmail);
    const referralService = require('./referral.service');

    const execute = async (tx) => {
      // 1. Check for existing durable attribution for this identity (Re-registration / First-Touch)
      let attribution = await ReferralAttribution.findOne({
        where: { referredIdentityHash: identityHash },
        order: [['originalAttributedAt', 'ASC']],
        transaction: tx
      });

      if (attribution) {
        // Prior attribution exists for this human identity!
        const originalReferrerId = attribution.referrerUserId;

        // Prevent self-referral
        if (String(originalReferrerId) === String(userId)) {
          logger.warn(`Self-referral detected during re-registration for user ${userId}. Ignoring.`);
          return { attributed: false };
        }

        logger.info(`Persistent attribution matched for identity ${identityHash} (Original Referrer: ${originalReferrerId})`);

        // Re-associate current user ID with the durable attribution
        await attribution.update({
          currentUserId: userId,
          userId,
          status: 're_registered'
        }, { transaction: tx });

        // Re-establish relationship and closure tree under original referrer
        await referralService.establishReferralRelationship({
          referrerId: originalReferrerId,
          referredUserId: userId,
          referredIdentityHash: identityHash,
          referralCode: attribution.referralCode,
          attributionId: String(attribution.id)
        }, tx);

        return {
          attributed: true,
          referrerId: originalReferrerId,
          referralCode: attribution.referralCode,
          isReRegistration: true
        };
      }

      // 2. If no identity attribution exists yet, check pending touchpoint (anonymousId or attributionId)
      if (attributionId || anonymousId) {
        const whereTouchpoint = { status: 'pending' };
        if (attributionId) whereTouchpoint.id = attributionId;
        else if (anonymousId) whereTouchpoint.anonymousId = anonymousId;

        const touchpoint = await ReferralAttribution.findOne({
          where: whereTouchpoint,
          order: [['createdAt', 'DESC']],
          transaction: tx
        });

        if (touchpoint && touchpoint.referrerUserId && String(touchpoint.referrerUserId) !== String(userId)) {
          attribution = touchpoint;
          await attribution.update({
            referredIdentityHash: identityHash,
            currentUserId: userId,
            userId,
            status: 'converted'
          }, { transaction: tx });

          await referralService.establishReferralRelationship({
            referrerId: attribution.referrerUserId,
            referredUserId: userId,
            referredIdentityHash: identityHash,
            referralCode: attribution.referralCode,
            attributionId: String(attribution.id)
          }, tx);

          return {
            attributed: true,
            referrerId: attribution.referrerUserId,
            referralCode: attribution.referralCode,
            isReRegistration: false
          };
        }
      }

      // 3. If no pre-existing attribution, but user registered with an incoming referral code
      if (incomingReferralCode && typeof incomingReferralCode === 'string' && incomingReferralCode.trim()) {
        const cleanCode = incomingReferralCode.trim().toUpperCase();
        const codeRecord = await ReferralCode.findOne({
          where: { referralCode: cleanCode, isActive: true },
          include: [{ model: User, as: 'user', attributes: ['id', 'email'] }],
          transaction: tx
        });

        if (codeRecord && codeRecord.user) {
          const referrerUser = codeRecord.user;

          // Self-referral validation
          if (String(referrerUser.id) === String(userId) || this.normalizeEmail(referrerUser.email) === normalizedEmail) {
            logger.warn(`Self-referral rejected for user ${userId} using code ${cleanCode}`);
            return { attributed: false, reason: 'self_referral' };
          }

          // Create the durable attribution record
          try {
            attribution = await ReferralAttribution.create({
              referredIdentityHash: identityHash,
              referrerUserId: referrerUser.id,
              referralCode: cleanCode,
              originalAttributedAt: new Date(),
              currentUserId: userId,
              userId,
              anonymousId: anonymousId || `anon_${Date.now()}`,
              status: 'converted'
            }, { transaction: tx });
          } catch (createErr) {
            // Concurrency safety: handle simultaneous duplicate registration requests
            attribution = await ReferralAttribution.findOne({
              where: { referredIdentityHash: identityHash },
              transaction: tx
            });
          }

          if (attribution) {
            await referralService.establishReferralRelationship({
              referrerId: referrerUser.id,
              referredUserId: userId,
              referredIdentityHash: identityHash,
              referralCode: cleanCode,
              attributionId: String(attribution.id)
            }, tx);

            return {
              attributed: true,
              referrerId: referrerUser.id,
              referralCode: cleanCode,
              isReRegistration: false
            };
          }
        }
      }

      return { attributed: false };
    };

    if (transaction) {
      return await execute(transaction);
    }
    return await sequelize.transaction(execute);
  }

  /**
   * Legacy compatibility method
   */
  async linkAttributionToUser({ referralCode, userId, anonymousId = null, email = null }, transaction = null) {
    if (email) {
      return await this.attributeOnRegistration({
        email,
        userId,
        incomingReferralCode: referralCode,
        anonymousId
      }, transaction);
    }

    if (!referralCode || !userId) return null;

    const where = {
      referralCode: String(referralCode).trim().toUpperCase(),
      status: 'pending'
    };
    if (anonymousId) where.anonymousId = anonymousId;

    const attribution = await ReferralAttribution.findOne({
      where,
      order: [['createdAt', 'DESC']],
      transaction
    });

    if (attribution) {
      await attribution.update({
        currentUserId: userId,
        userId,
        status: 'converted'
      }, { transaction });
      return attribution;
    }

    return null;
  }
}

module.exports = new AttributionService();
