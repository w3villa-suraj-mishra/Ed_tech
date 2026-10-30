const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticateUser } = require('../../../middleware/auth');

router.get('/wallet/me', authenticateUser, walletController.getBalance);
router.get('/wallet/me/transactions', authenticateUser, walletController.getTransactions);
router.post('/wallet/apply-credit', authenticateUser, walletController.applyCredit);

module.exports = router;

