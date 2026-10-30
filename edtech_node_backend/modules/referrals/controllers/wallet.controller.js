const walletService = require('../services/wallet.service');

const walletController = {
  /**
   * Get wallet balance
   */
  getBalance: async (req, res) => {
    try {
      const summary = await walletService.getWalletSummary(req.user.id);
      return res.status(200).json({ success: true, data: summary });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get wallet transaction ledger
   */
  getTransactions: async (req, res) => {
    try {
      const { page = 1, limit = 10, type } = req.query;
      const data = await walletService.getWalletTransactions(req.user.id, { page, limit, type });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Calculate applicable wallet credit redemption for a course purchase
   */
  applyCredit: async (req, res) => {
    try {
      const { courseAmountRupees } = req.body;
      const amount = Number(courseAmountRupees);
      if (Number.isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Valid courseAmountRupees is required' });
      }

      const summary = await walletService.getWalletSummary(req.user.id);
      const availableCredits = summary.availableBalanceRupees;

      // Cannot redeem more credits than the payable amount
      const redeemableCredits = Math.min(availableCredits, amount);
      const remainingPayable = Math.max(0, amount - redeemableCredits);

      return res.status(200).json({
        success: true,
        data: {
          originalAmountRupees: amount,
          availableCreditsRupees: availableCredits,
          appliedCreditsRupees: redeemableCredits,
          netPayableRupees: remainingPayable,
          isFullRedemption: remainingPayable === 0
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = walletController;

