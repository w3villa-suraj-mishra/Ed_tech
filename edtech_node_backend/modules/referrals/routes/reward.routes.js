const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/reward.controller');
const { authenticateUser } = require('../../../middleware/auth');

router.get('/rewards/me', authenticateUser, rewardController.getSummary);
router.get('/rewards/me/history', authenticateUser, rewardController.getHistory);
router.get('/rewards/me/network-earnings', authenticateUser, rewardController.getNetworkEarnings);

module.exports = router;

