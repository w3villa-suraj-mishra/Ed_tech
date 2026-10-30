const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referral.controller');
const { authenticateUser } = require('../../../middleware/auth');

// Referral Link Generation & Profile
router.post('/referrals/generate-link', authenticateUser, referralController.generateLink);
router.get('/referrals/me', authenticateUser, referralController.getProfile);
router.get('/referrals/me/network', authenticateUser, referralController.getNetwork);
router.get('/referrals/me/history', authenticateUser, referralController.getHistory);
router.get('/referrals/me/stats', authenticateUser, referralController.getStats);

// Public Validation, Claim & Attribution
router.post('/referrals/validate', referralController.validateCode);
router.post('/referrals/claim', referralController.claimCode);
router.post('/attribution/capture', referralController.captureAttribution);

module.exports = router;
