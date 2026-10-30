const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
process.env.ENABLE_MULTI_LEVEL_REWARDS = 'true';
const {
  sequelize,
  User,
  ReferralCode,
  ReferralRelationship,
  ReferralTree,
  ReferralRewardRule,
  ReferralRewardLedger,
  ReferralAttribution,
  Wallet,
  WalletTransaction
} = require('../models');

const referralService = require('../modules/referrals/services/referral.service');
const rewardService = require('../modules/referrals/services/reward.service');
const walletService = require('../modules/referrals/services/wallet.service');
const attributionService = require('../modules/referrals/services/attribution.service');

describe('Multi-Level Referral and Reward System', () => {
  let users = {};
  const testEmails = [
    'jest_ref_a@example.com',
    'jest_ref_b@example.com',
    'jest_ref_c@example.com',
    'jest_ref_d@example.com',
    'jest_ref_f@example.com',
    'jest_ref_g@example.com',
    'jest_ref_h@example.com',
    'jest_ref_j@example.com',
    'jest_ref_k@example.com'
  ];

  beforeAll(async () => {
    await sequelize.authenticate();

    // Ensure reward rules exist
    const ruleCount = await ReferralRewardRule.count();
    if (ruleCount === 0) {
      const now = new Date();
      await ReferralRewardRule.bulkCreate([
        { rewardType: 'REGISTRATION', level: 0, rewardPercentage: 0.00, fixedAmountPaise: 2000, isActive: true, effectiveFrom: now },
        { rewardType: 'COURSE_PURCHASE', level: 1, rewardPercentage: 10.00, fixedAmountPaise: 0, isActive: true, effectiveFrom: now },
        { rewardType: 'COURSE_PURCHASE', level: 2, rewardPercentage: 5.00, fixedAmountPaise: 0, isActive: true, effectiveFrom: now },
        { rewardType: 'COURSE_PURCHASE', level: 3, rewardPercentage: 2.00, fixedAmountPaise: 0, isActive: true, effectiveFrom: now },
        { rewardType: 'COURSE_PURCHASE', level: 4, rewardPercentage: 1.00, fixedAmountPaise: 0, isActive: true, effectiveFrom: now }
      ]);
    }

    // Clean previous runs
    const existing = await User.findAll({ where: { email: testEmails } });
    if (existing.length > 0) {
      const ids = existing.map(u => u.id);
      await ReferralAttribution.destroy({ where: { userId: ids } });
      await WalletTransaction.destroy({ where: { userId: ids } });
      await ReferralRewardLedger.destroy({ where: { userId: ids } });
      await ReferralTree.destroy({ where: { [sequelize.Sequelize.Op.or]: [{ ancestorId: ids }, { descendantId: ids }] } });
      await ReferralRelationship.destroy({ where: { [sequelize.Sequelize.Op.or]: [{ referrerId: ids }, { referredUserId: ids }] } });
      await ReferralCode.destroy({ where: { userId: ids } });
      await Wallet.destroy({ where: { userId: ids } });
      await User.destroy({ where: { id: ids } });
    }

    // Create 9 test users
    for (const email of testEmails) {
      const letter = email.split('_')[2].split('@')[0].toUpperCase();
      const user = await User.create({
        firstName: 'Student',
        lastName: letter,
        email,
        password: 'Password123!',
        passwordConfirmation: 'Password123!',
        accountType: 'Student',
        approved: true
      });
      users[letter] = user;
      await walletService.getOrCreateWallet(user.id);
    }
  });

  afterAll(async () => {
    const ids = Object.values(users).map(u => u.id);
    if (ids.length > 0) {
      await ReferralAttribution.destroy({ where: { userId: ids } });
      await WalletTransaction.destroy({ where: { userId: ids } });
      await ReferralRewardLedger.destroy({ where: { userId: ids } });
      await ReferralTree.destroy({ where: { [sequelize.Sequelize.Op.or]: [{ ancestorId: ids }, { descendantId: ids }] } });
      await ReferralRelationship.destroy({ where: { [sequelize.Sequelize.Op.or]: [{ referrerId: ids }, { referredUserId: ids }] } });
      await ReferralCode.destroy({ where: { userId: ids } });
      await Wallet.destroy({ where: { userId: ids } });
      await User.destroy({ where: { id: ids } });
    }
    await sequelize.close();
  });

  test('1. Generates referral codes and blocks self-referral', async () => {
    const codeA = await referralService.getOrCreateReferralCode(users.A);
    expect(codeA).toBeTruthy();
    expect(codeA.startsWith('USR_')).toBe(true);

    // Verify custom link generation
    const linkObjA = await referralService.generateCustomReferralLink(users.A);
    expect(linkObjA.referralUrl).toContain(`/register?ref=${codeA}`);

    // Verify attribution capture
    const attr = await attributionService.captureAttribution({
      anonymousId: 'anon_jest_1',
      referralCode: codeA,
      channel: 'web',
      landingPage: '/register'
    });
    expect(attr.referralCode).toBe(codeA);

    await expect(
      referralService.establishReferralRelationship({
        referrerId: users.A.id,
        referredUserId: users.A.id,
        referralCode: codeA
      })
    ).rejects.toThrow('Self-referral is not permitted');
  });

  test('2. Establishes Level 1 relationships (A -> B, C, D) and awards ₹20 registration reward idempotently', async () => {
    const codeA = await referralService.getOrCreateReferralCode(users.A);

    for (const child of [users.B, users.C, users.D]) {
      await referralService.establishReferralRelationship({
        referrerId: users.A.id,
        referredUserId: child.id,
        referralCode: codeA
      });
      await rewardService.processRegistrationReward(child.id);
    }

    // A receives ₹20 x 3 = ₹60 (6000 paise)
    const walletA = await walletService.getWalletSummary(users.A.id);
    expect(walletA.availableBalanceRupees).toBe(60);

    // Repeated registration call for B is idempotent (returns existing ledger)
    const repeatRes = await rewardService.processRegistrationReward(users.B.id);
    expect(repeatRes).not.toBeNull();
    const walletA_afterRepeat = await walletService.getWalletSummary(users.A.id);
    expect(walletA_afterRepeat.availableBalanceRupees).toBe(60);

    // Re-referring B with another referrer fails (single immutable referrer rule)
    const codeD = await referralService.getOrCreateReferralCode(users.D);
    await expect(
      referralService.establishReferralRelationship({
        referrerId: users.D.id,
        referredUserId: users.B.id,
        referralCode: codeD
      })
    ).rejects.toThrow('Referrer cannot be changed');
  });

  test('3. Builds sub-levels (D -> F, G, H) and leaf level (H -> J, K), blocking circular references', async () => {
    const codeD = await referralService.getOrCreateReferralCode(users.D);
    for (const child of [users.F, users.G, users.H]) {
      await referralService.establishReferralRelationship({
        referrerId: users.D.id,
        referredUserId: child.id,
        referralCode: codeD
      });
      await rewardService.processRegistrationReward(child.id);
    }

    const codeH = await referralService.getOrCreateReferralCode(users.H);
    for (const child of [users.J, users.K]) {
      await referralService.establishReferralRelationship({
        referrerId: users.H.id,
        referredUserId: child.id,
        referralCode: codeH
      });
      await rewardService.processRegistrationReward(child.id);
    }

    // J cannot refer A (circular reference blocked)
    const codeJ = await referralService.getOrCreateReferralCode(users.J);
    await expect(
      referralService.establishReferralRelationship({
        referrerId: users.J.id,
        referredUserId: users.A.id,
        referralCode: codeJ
      })
    ).rejects.toThrow(/Circular referral/i);

    // Verify J has 3 ancestors (H at depth 1, D at depth 2, A at depth 3)
    const ancestorsJ = await referralService.getAncestorsForReward(users.J.id);
    expect(ancestorsJ).toHaveLength(3);
    expect(ancestorsJ[0]).toEqual({ ancestorId: users.H.id, depth: 1 });
    expect(ancestorsJ[1]).toEqual({ ancestorId: users.D.id, depth: 2 });
    expect(ancestorsJ[2]).toEqual({ ancestorId: users.A.id, depth: 3 });
  });

  test('4. Distributes multi-level commissions on ₹2,000 course purchase: H=10% (₹200), D=5% (₹100), A=2% (₹40), Peers=₹0', async () => {
    const orderId = `JEST_ORD_${Date.now()}`;
    const result = await rewardService.processCoursePurchaseRewards({
      purchaserId: users.J.id,
      orderId,
      paidAmountPaise: 200000, // ₹2,000
      courseName: 'Complete Web Dev'
    });

    expect(result.totalRewardsAwardedRupees).toBe(340);

    // User H: ₹40 (reg) + ₹200 (10%) = ₹240
    const walletH = await walletService.getWalletSummary(users.H.id);
    expect(walletH.availableBalanceRupees).toBe(240);

    // User D: ₹60 (reg) + ₹100 (5%) = ₹160
    const walletD = await walletService.getWalletSummary(users.D.id);
    expect(walletD.availableBalanceRupees).toBe(160);

    // User A: ₹60 (reg) + ₹40 (2%) = ₹100
    const walletA = await walletService.getWalletSummary(users.A.id);
    expect(walletA.availableBalanceRupees).toBe(100);

    // Unrelated peers have 0 balance
    const walletB = await walletService.getWalletSummary(users.B.id);
    const walletK = await walletService.getWalletSummary(users.K.id);
    expect(walletB.availableBalanceRupees).toBe(0);
    expect(walletK.availableBalanceRupees).toBe(0);

    // Duplicate webhook idempotency
    const dupResult = await rewardService.processCoursePurchaseRewards({
      purchaserId: users.J.id,
      orderId,
      paidAmountPaise: 200000,
      courseName: 'Complete Web Dev'
    });
    expect(dupResult.totalRewardsAwardedRupees).toBe(0);

    // Reversal on refund
    const reversed = await rewardService.reverseOrderRewards({ orderId, reason: 'Full refund' });
    expect(reversed).toHaveLength(3);

    const walletH_postRefund = await walletService.getWalletSummary(users.H.id);
    expect(walletH_postRefund.availableBalanceRupees).toBe(40);
  });
});
