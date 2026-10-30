const express = require('express');
const router = express.Router();
const referralAdminController = require('../controllers/referralAdmin.controller');
const { authenticateAdmin, requireSuperAdmin } = require('../../../middleware/adminAuth');

router.use(authenticateAdmin);

router.get('/referrals/overview', referralAdminController.getOverview);
router.get('/referrals/network', referralAdminController.getNetwork);
router.get('/referrals/rewards', referralAdminController.getRewards);
router.get('/referrals/rules', referralAdminController.getRules);
router.put('/referrals/rules', requireSuperAdmin, referralAdminController.updateRules);
router.get('/referrals/transactions', referralAdminController.getTransactions);
router.post('/referrals/audit-override', requireSuperAdmin, referralAdminController.auditOverride);

module.exports = router;

