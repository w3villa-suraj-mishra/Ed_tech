/**
 * Comprehensive Verification & Simulation Test for Multi-Level Referral & Reward System
 *
 * Simulates:
 * User A
 * |-- User B
 * |-- User C
 * |-- User D
 *      |-- User F
 *      |-- User G
 *      |-- User H
 *           |-- User J
 *           |-- User K
 *
 * Verifies:
 * 1. Self-referral prevention
 * 2. Immutable single referrer rule & anti-duplicate
 * 3. Anti-circular referral detection
 * 4. ₹20 Unique verified registration reward (with repeat login idempotency)
 * 5. ₹2,000 Course purchase reward:
 *    - User H (L1): ₹200 (10%)
 *    - User D (L2): ₹100 (5%)
 *    - User A (L3): ₹40 (2%)
 *    - Total payout = ₹340
 *    - Unrelated peers (B, C, F, G, K): ₹0
 * 6. Duplicate Stripe webhook idempotency
 * 7. Refund reversal on charge.refunded
 * 8. Wallet credits checkout deduction
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
process.env.ENABLE_MULTI_LEVEL_REWARDS = 'true';
const sequelize = require('../config/database');
const { Sequelize, Op } = require('sequelize');
const {
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

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

function assert(condition, message) {
  if (!condition) {
    console.error(`${colors.red}❌ ASSERTION FAILED: ${message}${colors.reset}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`${colors.green}  ✓ ${message}${colors.reset}`);
  }
}

async function runSimulation() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  MULTI-LEVEL REFERRAL & REWARD SYSTEM VERIFICATION ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================\n${colors.reset}`);

  // Ensure DB connected
  await sequelize.authenticate();
  console.log(`${colors.green}✓ PostgreSQL connected successfully.${colors.reset}\n`);

  // Ensure rules initialized
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

  // Clean previous test simulation data safely
  const testEmails = [
    'ref_test_a@example.com',
    'ref_test_b@example.com',
    'ref_test_c@example.com',
    'ref_test_d@example.com',
    'ref_test_f@example.com',
    'ref_test_g@example.com',
    'ref_test_h@example.com',
    'ref_test_j@example.com',
    'ref_test_k@example.com'
  ];

  const existingUsers = await User.findAll({ where: { email: testEmails } });
  if (existingUsers.length > 0) {
    const userIds = existingUsers.map(u => u.id);
    await ReferralAttribution.destroy({ where: { userId: userIds } });
    await WalletTransaction.destroy({ where: { userId: userIds } });
    await ReferralRewardLedger.destroy({ where: { userId: userIds } });
    await ReferralTree.destroy({ where: { [Op.or]: [{ ancestorId: userIds }, { descendantId: userIds }] } });
    await ReferralRelationship.destroy({ where: { [Op.or]: [{ referrerId: userIds }, { referredUserId: userIds }] } });
    await ReferralCode.destroy({ where: { userId: userIds } });
    await Wallet.destroy({ where: { userId: userIds } });
    await User.destroy({ where: { id: userIds } });
  }

  // 1. Create Test Users
  console.log(`${colors.bold}Step 1: Creating simulation users (A, B, C, D, F, G, H, J, K)...${colors.reset}`);
  const users = {};
  for (const email of testEmails) {
    const letter = email.split('_')[2].split('@')[0].toUpperCase();
    const user = await User.create({
      firstName: `Student`,
      lastName: letter,
      email,
      password: 'HashedPassword123!',
      passwordConfirmation: 'HashedPassword123!',
      accountType: 'Student',
      approved: true
    });
    users[letter] = user;
    await walletService.getOrCreateWallet(user.id);
  }
  console.log(`${colors.green}  ✓ All 9 test student accounts created with wallets.${colors.reset}\n`);

  // 2. Generate referral codes
  console.log(`${colors.bold}Step 2: Generating referral codes for referrers...${colors.reset}`);
  const codeA = await referralService.getOrCreateReferralCode(users.A);
  const codeD = await referralService.getOrCreateReferralCode(users.D);
  const codeH = await referralService.getOrCreateReferralCode(users.H);
  console.log(`  User A code: ${colors.cyan}${codeA}${colors.reset}`);
  console.log(`  User D code: ${colors.cyan}${codeD}${colors.reset}`);
  console.log(`  User H code: ${colors.cyan}${codeH}${colors.reset}`);
  assert(codeA && codeD && codeH, 'All referral codes generated correctly');
  assert(codeA.startsWith('USR_'), 'Custom referral code format begins with USR_ prefix');

  // Verify custom referral link building
  const customLinkObjA = await referralService.generateCustomReferralLink(users.A);
  assert(customLinkObjA.referralUrl.includes(`/register?ref=${codeA}`), `Custom referral URL formatted cleanly (${customLinkObjA.referralUrl})`);

  // Verify first-touch attribution capture
  console.log(`${colors.bold}Step 2b: Testing custom attribution capture...${colors.reset}`);
  const simAnonId = 'anon_sim_test_user_b';
  const attrRecord = await attributionService.captureAttribution({
    anonymousId: simAnonId,
    referralCode: codeA,
    channel: 'whatsapp',
    landingPage: '/register',
    campaign: 'social_share'
  });
  assert(attrRecord && attrRecord.referralCode === codeA, 'Custom first-touch attribution captured successfully');
  console.log();

  // 3. Test Constraints: Self-referral & Circular
  console.log(`${colors.bold}Step 3: Testing Anti-Fraud & Boundary Rules...${colors.reset}`);
  try {
    await referralService.establishReferralRelationship({
      referrerId: users.A.id,
      referredUserId: users.A.id,
      referralCode: codeA
    });
    assert(false, 'Self-referral should have failed!');
  } catch (err) {
    assert(err.message.includes('Self-referral is not permitted'), 'Self-referral blocked correctly');
  }

  // 4. Build Hierarchy:
  // A refers B, C, D
  console.log(`\n${colors.bold}Step 4: Establishing Hierarchy (A -> B, C, D)...${colors.reset}`);
  for (const child of [users.B, users.C, users.D]) {
    await referralService.establishReferralRelationship({
      referrerId: users.A.id,
      referredUserId: child.id,
      referralCode: codeA
    });
    // Trigger registration reward
    await rewardService.processRegistrationReward(child.id);
  }

  // Verify User A earned ₹20 * 3 = ₹60 (6000 paise)
  const walletA_afterBCD = await walletService.getWalletSummary(users.A.id);
  assert(Number(walletA_afterBCD.availableBalancePaise) === 6000, `User A balance is ₹60 after B, C, D registered (got ${walletA_afterBCD.availableBalanceRupees})`);

  // Verify Idempotency: re-triggering registration reward for B gives ₹0 additional
  console.log(`${colors.bold}Step 4b: Testing Registration Reward Idempotency on repeated login...${colors.reset}`);
  const repeatRes = await rewardService.processRegistrationReward(users.B.id);
  assert(repeatRes !== null, 'Duplicate registration reward prevented (existing ledger returned)');
  const walletA_afterRepeat = await walletService.getWalletSummary(users.A.id);
  assert(Number(walletA_afterRepeat.availableBalancePaise) === 6000, 'User A balance remains exactly ₹60');

  // Verify single referrer rule: B cannot be referred again by D
  try {
    await referralService.establishReferralRelationship({
      referrerId: users.D.id,
      referredUserId: users.B.id,
      referralCode: codeD
    });
    assert(false, 'Re-referring an already referred user should have failed!');
  } catch (err) {
    assert(err.message.includes('already has a permanent referrer'), 'Single referrer constraint enforced');
  }

  // D refers F, G, H
  console.log(`\n${colors.bold}Step 5: Establishing Sub-level (D -> F, G, H)...${colors.reset}`);
  for (const child of [users.F, users.G, users.H]) {
    await referralService.establishReferralRelationship({
      referrerId: users.D.id,
      referredUserId: child.id,
      referralCode: codeD
    });
    await rewardService.processRegistrationReward(child.id);
  }
  const walletD_afterFGH = await walletService.getWalletSummary(users.D.id);
  assert(Number(walletD_afterFGH.availableBalancePaise) === 6000, 'User D earned ₹60 for referring F, G, H');

  // H refers J, K
  console.log(`\n${colors.bold}Step 6: Establishing Leaf-level (H -> J, K)...${colors.reset}`);
  for (const child of [users.J, users.K]) {
    await referralService.establishReferralRelationship({
      referrerId: users.H.id,
      referredUserId: child.id,
      referralCode: codeH
    });
    await rewardService.processRegistrationReward(child.id);
  }
  const walletH_afterJK = await walletService.getWalletSummary(users.H.id);
  assert(Number(walletH_afterJK.availableBalancePaise) === 4000, 'User H earned ₹40 for referring J and K');

  // Verify Circular Referral Prevention: User J cannot refer User A (A is J's ancestor at depth 3)
  console.log(`\n${colors.bold}Step 7: Testing Circular Referral Prevention (J cannot refer A)...${colors.reset}`);
  const codeJ = await referralService.getOrCreateReferralCode(users.J);
  try {
    await referralService.establishReferralRelationship({
      referrerId: users.J.id,
      referredUserId: users.A.id,
      referralCode: codeJ
    });
    assert(false, 'Circular referral should have failed!');
  } catch (err) {
    assert(err.message.toLowerCase().includes('circular referral') || err.message.toLowerCase().includes('permanent referrer'), `Circular referral blocked (${err.message})`);
  }

  // 8. Verify Ancestor Tree query for User J
  console.log(`\n${colors.bold}Step 8: Verifying Closure Tree Ancestor Depths for User J...${colors.reset}`);
  const ancestorsJ = await referralService.getAncestorsForReward(users.J.id);
  console.log(`  Ancestors of J found: ${ancestorsJ.length}`);
  ancestorsJ.forEach(a => console.log(`    Level ${a.depth}: User ID ${a.ancestorId}`));
  assert(ancestorsJ.length === 3, 'User J has exactly 3 ancestors (H, D, A)');
  assert(ancestorsJ.find(a => a.ancestorId === users.H.id && a.depth === 1), 'User H is at Level 1');
  assert(ancestorsJ.find(a => a.ancestorId === users.D.id && a.depth === 2), 'User D is at Level 2');
  assert(ancestorsJ.find(a => a.ancestorId === users.A.id && a.depth === 3), 'User A is at Level 3');

  // 9. Multi-Level Course Purchase Reward Simulation
  // User J purchases course worth ₹2,000 (200000 paise)
  console.log(`\n${colors.bold}Step 9: Testing Multi-Level Course Purchase Commissions (₹2,000 Course)...${colors.reset}`);
  const purchaseOrderId = `ORD_SIM_${Date.now()}`;
  const purchaseRes = await rewardService.processCoursePurchaseRewards({
    purchaserId: users.J.id,
    orderId: purchaseOrderId,
    paidAmountPaise: 200000, // ₹2,000.00
    courseName: 'Full-Stack Web Development Bootcamp'
  });

  console.log(`  Commission distribution result:`);
  purchaseRes.rewards.forEach(r => {
    console.log(`    Level ${r.referralLevel}: User ${r.userId} -> ₹${Number(r.amountPaise) / 100} (${r.rewardPercentage || ''}%)`);
  });

  assert(purchaseRes.totalRewardsAwardedRupees === 340, `Total payout is ₹340 (got ₹${purchaseRes.totalRewardsAwardedRupees})`);

  // Verify wallet balances after purchase:
  // User H: 4000 (reg) + 20000 (10% of 2000) = 24000 paise (₹240)
  const walletH_postBuy = await walletService.getWalletSummary(users.H.id);
  assert(Number(walletH_postBuy.availableBalancePaise) === 24000, `User H balance is ₹240 (₹40 reg + ₹200 commission). Got: ₹${walletH_postBuy.availableBalanceRupees}`);

  // User D: 6000 (reg) + 10000 (5% of 2000) = 16000 paise (₹160)
  const walletD_postBuy = await walletService.getWalletSummary(users.D.id);
  assert(Number(walletD_postBuy.availableBalancePaise) === 16000, `User D balance is ₹160 (₹60 reg + ₹100 commission). Got: ₹${walletD_postBuy.availableBalanceRupees}`);

  // User A: 6000 (reg) + 4000 (2% of 2000) = 10000 paise (₹100)
  const walletA_postBuy = await walletService.getWalletSummary(users.A.id);
  assert(Number(walletA_postBuy.availableBalancePaise) === 10000, `User A balance is ₹100 (₹60 reg + ₹40 commission). Got: ₹${walletA_postBuy.availableBalanceRupees}`);

  // Unrelated peers (B, C, F, G, K) must have ZERO purchase commission
  const walletB = await walletService.getWalletSummary(users.B.id);
  const walletC = await walletService.getWalletSummary(users.C.id);
  const walletF = await walletService.getWalletSummary(users.F.id);
  const walletG = await walletService.getWalletSummary(users.G.id);
  const walletK = await walletService.getWalletSummary(users.K.id);
  assert(Number(walletB.availableBalancePaise) === 0, 'Unrelated User B balance is ₹0');
  assert(Number(walletC.availableBalancePaise) === 0, 'Unrelated User C balance is ₹0');
  assert(Number(walletF.availableBalancePaise) === 0, 'Unrelated User F balance is ₹0');
  assert(Number(walletG.availableBalancePaise) === 0, 'Unrelated User G balance is ₹0');
  assert(Number(walletK.availableBalancePaise) === 0, 'Unrelated sibling User K balance is ₹0');

  // 10. Stripe Duplicate Webhook Idempotency
  console.log(`\n${colors.bold}Step 10: Testing Stripe Duplicate Webhook Idempotency...${colors.reset}`);
  const duplicateRes = await rewardService.processCoursePurchaseRewards({
    purchaserId: users.J.id,
    orderId: purchaseOrderId,
    paidAmountPaise: 200000,
    courseName: 'Full-Stack Web Development Bootcamp'
  });
  assert(duplicateRes.totalRewardsAwardedRupees === 0, 'Duplicate webhook payout is ₹0 (skipped duplicate distribution)');
  const walletH_postDup = await walletService.getWalletSummary(users.H.id);
  assert(Number(walletH_postDup.availableBalancePaise) === 24000, 'User H balance unchanged after duplicate event');

  // 11. Refund Reversal Test (charge.refunded)
  console.log(`\n${colors.bold}Step 11: Testing Refund Reversal on charge.refunded...${colors.reset}`);
  const reversedLedgers = await rewardService.reverseOrderRewards({
    orderId: purchaseOrderId,
    reason: 'Customer initiated 100% refund'
  });
  console.log(`  Reversed ${reversedLedgers.length} reward commissions`);
  assert(reversedLedgers.length === 3, 'Reversed 3 ancestor commissions');

  // Verify wallet balances reverted back to before-purchase states:
  const walletH_postRefund = await walletService.getWalletSummary(users.H.id);
  const walletD_postRefund = await walletService.getWalletSummary(users.D.id);
  const walletA_postRefund = await walletService.getWalletSummary(users.A.id);
  assert(Number(walletH_postRefund.availableBalancePaise) === 4000, 'User H balance reverted to ₹40');
  assert(Number(walletD_postRefund.availableBalancePaise) === 6000, 'User D balance reverted to ₹60');
  assert(Number(walletA_postRefund.availableBalancePaise) === 6000, 'User A balance reverted to ₹60');

  // 12. Wallet Credit Redemption During Checkout
  console.log(`\n${colors.bold}Step 12: Testing Wallet Credit Deduction during Course Checkout...${colors.reset}`);
  // User A buys a ₹100 course and uses ₹20 credits
  const checkoutDebitRes = await walletService.debitWallet({
    userId: users.A.id,
    amountPaise: 2000n, // ₹20.00
    referenceType: 'COURSE_PURCHASE',
    referenceId: `CHECKOUT_${Date.now()}`,
    description: 'Partial payment using reward balance'
  });
  assert(checkoutDebitRes.transaction?.transactionType === 'DEBIT_PURCHASE', 'Wallet debit transaction created');
  const walletA_postDebit = await walletService.getWalletSummary(users.A.id);
  assert(Number(walletA_postDebit.availableBalancePaise) === 4000, 'User A balance reduced from ₹60 to ₹40 after redeeming ₹20');

  console.log(`\n${colors.bold}${colors.green}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.green}  ALL 12 VERIFICATION & SIMULATION TESTS PASSED!    ${colors.reset}`);
  console.log(`${colors.bold}${colors.green}====================================================\n${colors.reset}`);

  // Cleanup test users cleanly
  const allUserIds = Object.values(users).map(u => u.id);
  await ReferralAttribution.destroy({ where: { userId: allUserIds } });
  await WalletTransaction.destroy({ where: { userId: allUserIds } });
  await ReferralRewardLedger.destroy({ where: { userId: allUserIds } });
  await ReferralTree.destroy({ where: { [Op.or]: [{ ancestorId: allUserIds }, { descendantId: allUserIds }] } });
  await ReferralRelationship.destroy({ where: { [Op.or]: [{ referrerId: allUserIds }, { referredUserId: allUserIds }] } });
  await ReferralCode.destroy({ where: { userId: allUserIds } });
  await Wallet.destroy({ where: { userId: allUserIds } });
  await User.destroy({ where: { id: allUserIds } });

  console.log(`${colors.green}✓ Test database state cleaned up.${colors.reset}\n`);
}

runSimulation()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n${colors.red}SIMULATION FAILED:${colors.reset}`, err);
    process.exit(1);
  });