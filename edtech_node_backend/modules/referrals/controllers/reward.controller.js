const rewardService = require('../services/reward.service');
const walletService = require('../services/wallet.service');

const rewardController = {
  /**
   * Get wallet and reward summary
   */
  getSummary: async (req, res) => {
    try {
      const [wallet, earnings] = await Promise.all([
        walletService.getWalletSummary(req.user.id),
        rewardService.getLevelEarningsBreakdown(req.user.id)
      ]);
      return res.status(200).json({
        success: true,
        data: {
          wallet,
          earnings
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get reward transaction history
   */
  getHistory: async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const data = await rewardService.getRewardHistory(req.user.id, { page, limit, status });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get level-wise earnings breakdown
   */
  getNetworkEarnings: async (req, res) => {
    try {
      const data = await rewardService.getLevelEarningsBreakdown(req.user.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = rewardController;

