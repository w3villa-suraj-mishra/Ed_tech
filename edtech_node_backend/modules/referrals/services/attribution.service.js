const { ReferralAttribution, ReferralCode, User } = require('../../../models');
const logger = require('../../../utils/logger');

class AttributionService {
  /**
   * Captures incoming referral attribution click or visit
   */
  async captureAttribution({ anonymousId, referralCode, channel = 'web', landingPage = '/register', campaign = 'referral' }) {
    if (!referralCode || typeof referralCode !== 'string') {
      const error = new Error('Referral code is required for attribution capture');
      error.statusCode = 400;
      throw error;
    }

    const cleanCode = referralCode.trim().toUpperCase();

    // Verify referral code exists and is active
    const codeRecord = await ReferralCode.findOne({
      where: { referralCode: cleanCode, isActive: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }]
    });

    if (!codeRecord) {
      const error = new Error('Invalid or inactive referral code');
      error.statusCode = 404;
      throw error;
    }

    // Generate or use anonymousId
    const anonId = anonymousId || `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create custom attribution record
    const attribution = await ReferralAttribution.create({
      anonymousId: anonId,
      referralCode: cleanCode,
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
   * Associates an attribution record with the newly registered user
   */
  async linkAttributionToUser({ referralCode, userId, anonymousId = null }, transaction = null) {
    if (!referralCode || !userId) return null;

    const where = {
      referralCode: String(referralCode).trim().toUpperCase(),
      status: 'pending'
    };

    if (anonymousId) {
      where.anonymousId = anonymousId;
    }

    const attribution = await ReferralAttribution.findOne({
      where,
      order: [['createdAt', 'DESC']],
      transaction
    });

    if (attribution) {
      await attribution.update({
        userId,
        status: 'converted'
      }, { transaction });

      logger.info(`Attribution converted: User ${userId} linked with Referral ${referralCode}`);
      return attribution;
    }

    return null;
  }
}

module.exports = new AttributionService();

