const referralService = require('../services/referral.service');
const attributionService = require('../services/attribution.service');
const walletService = require('../services/wallet.service');
const rewardService = require('../services/reward.service');
const referralGenerator = require('../services/referral.generator');
const { ReferralRelationship, ReferralCode, User } = require('../../../models');

const referralController = {
  /**
   * Get authenticated user's referral profile
   */
  getProfile: async (req, res) => {
    try {
      const user = req.user;
      const linkData = await referralService.generateCustomReferralLink(user);

      // Check if current user was referred by someone
      const directParentRelation = await ReferralRelationship.findOne({
        where: { referredUserId: user.id },
        include: [{ model: User, as: 'referrer', attributes: ['id', 'firstName', 'lastName'] }]
      });

      const wallet = await walletService.getWalletSummary(user.id);
      const network = await referralService.getNetworkHierarchy(user.id);

      return res.status(200).json({
        success: true,
        data: {
          referralCode: linkData.referralCode,
          referralUrl: linkData.referralUrl,
          directReferrer: directParentRelation ? {
            name: `${directParentRelation.referrer.firstName || ''} ${directParentRelation.referrer.lastName || ''}`.trim(),
            registeredAt: directParentRelation.registeredAt
          } : null,
          stats: {
            availableRewardRupees: wallet.availableBalanceRupees,
            lifetimeEarnedRupees: wallet.lifetimeEarnedRupees,
            directReferralCount: network.level1Count,
            totalNetworkCount: network.totalNetworkCount
          }
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Generate or retrieve custom referral link for authenticated user
   */
  generateLink: async (req, res) => {
    try {
      const linkData = await referralService.generateCustomReferralLink(req.user);
      return res.status(200).json({
        success: true,
        data: linkData
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Validate a referral code (Public endpoint)
   */
  validateCode: async (req, res) => {
    try {
      const { code } = req.body;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, valid: false, message: 'Referral code is required' });
      }

      const cleanCode = code.trim().toUpperCase();
      const referrer = await referralService.resolveReferralCode(cleanCode);

      if (!referrer) {
        return res.status(404).json({ success: false, valid: false, message: 'Invalid or inactive referral code' });
      }

      if (req.user && String(req.user.id) === String(referrer.id)) {
        return res.status(400).json({ success: false, valid: false, message: 'You cannot use your own referral code' });
      }

      return res.status(200).json({
        success: true,
        valid: true,
        data: {
          referralCode: cleanCode,
          referrerName: `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim()
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get multi-level hierarchy tree (depths 1 to 4)
   */
  getNetwork: async (req, res) => {
    try {
      const data = await referralService.getNetworkHierarchy(req.user.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get paginated direct referral history
   */
  getHistory: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await referralService.getDirectReferralHistory(req.user.id, { page, limit });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get comprehensive referral stats
   */
  getStats: async (req, res) => {
    try {
      const wallet = await walletService.getWalletSummary(req.user.id);
      const network = await referralService.getNetworkHierarchy(req.user.id);
      const breakdown = await rewardService.getLevelEarningsBreakdown(req.user.id);

      return res.status(200).json({
        success: true,
        data: {
          wallet,
          networkSummary: {
            directReferrals: network.level1Count,
            totalNetworkMembers: network.totalNetworkCount
          },
          levelEarnings: breakdown
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Public endpoint to validate and claim a referral code into visitor session
   */
  claimCode: async (req, res) => {
    try {
      const { code } = req.body;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, message: 'Referral code is required' });
      }

      const referrer = await referralService.resolveReferralCode(code);
      if (!referrer) {
        return res.status(404).json({ success: false, message: 'Invalid or expired referral code' });
      }

      if (req.user && String(req.user.id) === String(referrer.id)) {
        return res.status(400).json({ success: false, message: 'You cannot use your own referral code' });
      }

      return res.status(200).json({
        success: true,
        valid: true,
        data: {
          referrerName: `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim(),
          referralCode: String(code).trim().toUpperCase()
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Public capture attribution endpoint
   */
  captureAttribution: async (req, res) => {
    try {
      const { anonymousId, referralCode, channel, landingPage, campaign } = req.body;
      const attribution = await attributionService.captureAttribution({
        anonymousId,
        referralCode,
        channel,
        landingPage,
        campaign
      });
      return res.status(201).json({ success: true, data: attribution });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
};

module.exports = referralController;
