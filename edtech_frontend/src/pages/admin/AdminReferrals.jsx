import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getAdminReferralOverviewAPI,
  getAdminReferralRulesAPI,
  updateAdminReferralRulesAPI,
  getAdminReferralNetworkAPI,
  getAdminReferralTransactionsAPI,
  adminWalletOverrideAPI
} from '../../services/operations/referralAPI';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiDollarSign,
  FiShare2,
  FiSliders,
  FiSearch,
  FiRefreshCw,
  FiSave,
  FiLayers,
  FiArrowUpRight,
  FiActivity,
  FiX
} from 'react-icons/fi';

export default function AdminReferrals() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'rules' | 'network' | 'audit'
  const [loading, setLoading] = useState(true);

  // Overview Data
  const [overview, setOverview] = useState(null);

  // Rules Data
  const [rules, setRules] = useState([]);
  const [rulesForm, setRulesForm] = useState({
    registrationRewardRupees: 20,
    l1Percentage: 10,
    l2Percentage: 5,
    l3Percentage: 2,
    l4Percentage: 1,
    maxRewardRupees: 10000
  });
  const [savingRules, setSavingRules] = useState(false);

  // Network Explorer State
  const [networkQuery, setNetworkQuery] = useState('');
  const [networkData, setNetworkData] = useState(null);
  const [networkLoading, setNetworkLoading] = useState(false);

  // Audit Ledger State
  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnPage, setTxnPage] = useState(1);
  const [txnTypeFilter, setTxnTypeFilter] = useState('');

  // Manual Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({
    userId: '',
    type: 'CREDIT',
    amountRupees: '',
    reason: ''
  });
  const [adjusting, setAdjusting] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const data = await getAdminReferralOverviewAPI();
      setOverview(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load referral overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const data = await getAdminReferralRulesAPI();
      setRules(data || []);

      const regRule = data?.find(r => r.rewardType === 'REGISTRATION');
      const l1Rule = data?.find(r => r.rewardType === 'COURSE_PURCHASE' && r.level === 1);
      const l2Rule = data?.find(r => r.rewardType === 'COURSE_PURCHASE' && r.level === 2);
      const l3Rule = data?.find(r => r.rewardType === 'COURSE_PURCHASE' && r.level === 3);
      const l4Rule = data?.find(r => r.rewardType === 'COURSE_PURCHASE' && r.level === 4);

      setRulesForm({
        registrationRewardRupees: regRule?.fixedAmountPaise ? Number(regRule.fixedAmountPaise) / 100 : 20,
        l1Percentage: l1Rule ? Number(l1Rule.rewardPercentage) : 10,
        l2Percentage: l2Rule ? Number(l2Rule.rewardPercentage) : 5,
        l3Percentage: l3Rule ? Number(l3Rule.rewardPercentage) : 2,
        l4Percentage: l4Rule ? Number(l4Rule.rewardPercentage) : 1,
        maxRewardRupees: l1Rule?.maximumRewardPaise ? Number(l1Rule.maximumRewardPaise) / 100 : 10000
      });
    } catch (err) {
      console.warn('Failed to load rules:', err.message);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTxnLoading(true);
      const query = `page=${txnPage}&limit=15${txnTypeFilter ? `&type=${txnTypeFilter}` : ''}`;
      const data = await getAdminReferralTransactionsAPI(null, query);
      setTransactions(data?.transactions || []);
    } catch (err) {
      console.warn('Failed to load transactions:', err.message);
    } finally {
      setTxnLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchRules();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchTransactions();
    }
  }, [activeTab, txnPage, txnTypeFilter]);

  const handleSaveRules = async (e) => {
    e.preventDefault();
    setSavingRules(true);
    try {
      const payload = [
        {
          rewardType: 'REGISTRATION',
          level: 1,
          fixedAmountPaise: Math.round(Number(rulesForm.registrationRewardRupees) * 100),
          rewardPercentage: 0,
          isActive: true
        },
        {
          rewardType: 'COURSE_PURCHASE',
          level: 1,
          rewardPercentage: Number(rulesForm.l1Percentage),
          maximumRewardPaise: Math.round(Number(rulesForm.maxRewardRupees) * 100),
          isActive: true
        },
        {
          rewardType: 'COURSE_PURCHASE',
          level: 2,
          rewardPercentage: Number(rulesForm.l2Percentage),
          maximumRewardPaise: Math.round(Number(rulesForm.maxRewardRupees) * 100),
          isActive: true
        },
        {
          rewardType: 'COURSE_PURCHASE',
          level: 3,
          rewardPercentage: Number(rulesForm.l3Percentage),
          maximumRewardPaise: Math.round(Number(rulesForm.maxRewardRupees) * 100),
          isActive: true
        },
        {
          rewardType: 'COURSE_PURCHASE',
          level: 4,
          rewardPercentage: Number(rulesForm.l4Percentage),
          maximumRewardPaise: Math.round(Number(rulesForm.maxRewardRupees) * 100),
          isActive: true
        }
      ];

      await updateAdminReferralRulesAPI(null, payload);
      toast.success('Referral & Reward commission rules updated successfully!');
      fetchRules();
    } catch (err) {
      toast.error(err.message || 'Failed to update rules');
    } finally {
      setSavingRules(false);
    }
  };

  const handleSearchNetwork = async (e) => {
    e.preventDefault();
    if (!networkQuery.trim()) return;
    setNetworkLoading(true);
    try {
      const param = networkQuery.includes('@')
        ? `email=${encodeURIComponent(networkQuery.trim().toLowerCase())}`
        : `studentId=${encodeURIComponent(networkQuery.trim())}`;
      const data = await getAdminReferralNetworkAPI(null, param);
      setNetworkData(data);
    } catch (err) {
      toast.error(err.message || 'Student not found or failed to load network');
      setNetworkData(null);
    } finally {
      setNetworkLoading(false);
    }
  };

  const handleManualAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustData.userId || !adjustData.amountRupees || Number(adjustData.amountRupees) <= 0) {
      toast.error('Please enter valid user ID and positive amount');
      return;
    }

    setAdjusting(true);
    try {
      await adminWalletOverrideAPI(null, {
        userId: adjustData.userId,
        type: adjustData.type,
        amountPaise: Math.round(Number(adjustData.amountRupees) * 100),
        reason: adjustData.reason || 'Manual Admin Audit Adjustment'
      });
      toast.success(`Successfully adjusted wallet by ₹${adjustData.amountRupees}`);
      setAdjustModalOpen(false);
      setAdjustData({ userId: '', type: 'CREDIT', amountRupees: '', reason: '' });
      fetchTransactions();
      fetchOverview();
    } catch (err) {
      toast.error(err.message || 'Adjustment failed');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <FiShare2 className="text-[#3BA7F2]" />
              Multi-Level Referrals & Rewards
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Configure 4-level commission hierarchy, inspect student ancestor networks, and audit wallet credits.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchOverview();
                fetchRules();
                if (activeTab === 'audit') fetchTransactions();
              }}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setAdjustModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <FiSliders size={13} />
              <span>Wallet Adjustment</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition border-b-2 font-semibold flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-[#3BA7F2] text-[#3BA7F2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <FiActivity size={15} />
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3 transition border-b-2 font-semibold flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'border-[#3BA7F2] text-[#3BA7F2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <FiSliders size={15} />
            Commission Rules
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`pb-3 transition border-b-2 font-semibold flex items-center gap-2 ${
              activeTab === 'network'
                ? 'border-[#3BA7F2] text-[#3BA7F2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <FiLayers size={15} />
            Network Explorer
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 transition border-b-2 font-semibold flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-[#3BA7F2] text-[#3BA7F2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <FiDollarSign size={15} />
            Wallet Ledger & Audit
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
                  <span>Total Referrals</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#3BA7F2] flex items-center justify-center">
                    <FiUsers size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {overview?.totalReferrals || 0}
                  </span>
                  <span className="text-xs text-gray-400 block mt-0.5">Verified registrations linked</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
                  <span>Commissions Paid</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center">
                    <FiDollarSign size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ₹{overview?.totalCommissionsPaidRupees?.toLocaleString() || 0}
                  </span>
                  <span className="text-xs text-gray-400 block mt-0.5">Distributed to student wallets</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
                  <span>Active Referrers</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center">
                    <FiShare2 size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {overview?.activeReferrersCount || 0}
                  </span>
                  <span className="text-xs text-gray-400 block mt-0.5">Students who referred others</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
                  <span>Commission Rates</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                    <FiSliders size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    L1: 10% · L2: 5% · L3: 2% · L4: 1%
                  </span>
                  <span className="text-xs text-gray-400 block mt-0.5">+ ₹20 on direct registration</span>
                </div>
              </div>
            </div>

            {/* Leaderboard and Recent Referrals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leaderboard */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiArrowUpRight className="text-emerald-500" />
                  Top Referrers
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {overview?.topReferrers && overview.topReferrers.length > 0 ? (
                    overview.topReferrers.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              {item.name || item.email || `Student #${item.userId}`}
                            </p>
                            <p className="text-[10px] text-gray-400">{item.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {item.referralCount} referrals
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                            ₹{item.totalEarnedRupees || 0} earned
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-center text-xs text-gray-400">No referral activity recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Referrals */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiUsers className="text-[#3BA7F2]" />
                  Recent Referral Links
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {overview?.recentReferrals && overview.recentReferrals.length > 0 ? (
                    overview.recentReferrals.map((r, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {r.referredName || r.referredEmail || `User #${r.referredUserId}`}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Invited by: {r.referrerName || `Referrer #${r.referrerId}`} · Code: {r.referralCode}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                            Verified
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : 'Active'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-center text-xs text-gray-400">No recent referral records.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMMISSION RULES CONFIGURATION */}
        {activeTab === 'rules' && (
          <div className="max-w-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Referral Reward Policy & Commission Structure
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Rates configured here take immediate effect for all new verified registrations and course purchases.
              </p>
            </div>

            <form onSubmit={handleSaveRules} className="space-y-6">
              {/* Registration Rule */}
              <div className="bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] dark:text-sky-300 uppercase tracking-wider">
                      Type A: Direct Registration Reward
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Awarded once upon initial verified student signup to direct referrer.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">
                    One-time flat bonus
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Direct Referrer Bonus (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={rulesForm.registrationRewardRupees}
                      onChange={(e) => setRulesForm({ ...rulesForm, registrationRewardRupees: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:border-[#3BA7F2]"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Level Purchase Rules */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A] dark:text-gray-200 uppercase tracking-wider">
                    Type B: Multi-Level Course Purchase Rewards
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Distributed hierarchically to eligible ancestors (up to 4 levels) on verified Stripe course payment.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Level 1 */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Level 1: Direct Referrer (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={rulesForm.l1Percentage}
                      onChange={(e) => setRulesForm({ ...rulesForm, l1Percentage: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:border-[#3BA7F2]"
                    />
                  </div>

                  {/* Level 2 */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Level 2: Grandparent (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={rulesForm.l2Percentage}
                      onChange={(e) => setRulesForm({ ...rulesForm, l2Percentage: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:border-[#3BA7F2]"
                    />
                  </div>

                  {/* Level 3 */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Level 3: Great-Grandparent (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={rulesForm.l3Percentage}
                      onChange={(e) => setRulesForm({ ...rulesForm, l3Percentage: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:border-[#3BA7F2]"
                    />
                  </div>

                  {/* Level 4 */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Level 4: Ancestor (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={rulesForm.l4Percentage}
                      onChange={(e) => setRulesForm({ ...rulesForm, l4Percentage: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:border-[#3BA7F2]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Maximum Reward Cap per Transaction (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={rulesForm.maxRewardRupees}
                    onChange={(e) => setRulesForm({ ...rulesForm, maxRewardRupees: e.target.value })}
                    className="w-full sm:w-1/2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:border-[#3BA7F2]"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Prevents runaway payouts on expensive packages.</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingRules}
                  className="px-6 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md shadow-sky-500/20"
                >
                  <FiSave size={14} />
                  <span>{savingRules ? 'Updating Rules...' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: NETWORK EXPLORER */}
        {activeTab === 'network' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                Student Referral Network Explorer
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Inspect a student's full ancestor chain (who gets paid when they buy) and downline referrals.
              </p>

              <form onSubmit={handleSearchNetwork} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Enter student email or ID..."
                    value={networkQuery}
                    onChange={(e) => setNetworkQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={networkLoading}
                  className="px-4 py-2 bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  {networkLoading ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>

            {networkData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upline Ancestors */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <FiLayers className="text-[#3BA7F2]" />
                    Upline Ancestors (Beneficiaries)
                  </h3>
                  {networkData.ancestors && networkData.ancestors.length > 0 ? (
                    <div className="space-y-2">
                      {networkData.ancestors.map((anc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 font-extrabold flex items-center justify-center text-[10px]">
                              L{anc.depth}
                            </span>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-gray-200">
                                {anc.name || anc.email}
                              </p>
                              <p className="text-[10px] text-gray-400">ID: {anc.id} · {anc.email}</p>
                            </div>
                          </div>
                          <span className="font-extrabold text-[#3BA7F2]">
                            {anc.depth === 1 ? '10%' : anc.depth === 2 ? '5%' : anc.depth === 3 ? '2%' : '1%'} Cut
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-4 text-center">
                      No upline ancestors found (Student registered directly without referral).
                    </p>
                  )}
                </div>

                {/* Direct Downlines */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <FiUsers className="text-emerald-500" />
                    Direct Referred Students ({networkData.downlines?.length || 0})
                  </h3>
                  {networkData.downlines && networkData.downlines.length > 0 ? (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {networkData.downlines.map((child, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs"
                        >
                          <div>
                            <p className="font-bold text-gray-800 dark:text-gray-200">
                              {child.name || child.email}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              Joined: {child.registeredAt ? new Date(child.registeredAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            Active Downline
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-4 text-center">
                      This student has not referred any students yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WALLET LEDGER & AUDIT */}
        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Wallet Transactions Ledger
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Double-entry immutable record of all reward credits, debits, reversals, and deductions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={txnTypeFilter}
                  onChange={(e) => {
                    setTxnTypeFilter(e.target.value);
                    setTxnPage(1);
                  }}
                  className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:outline-none"
                >
                  <option value="">All Transaction Types</option>
                  <option value="CREDIT">Credits Only</option>
                  <option value="DEBIT">Debits Only</option>
                  <option value="REVERSAL">Reversals Only</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Reference / Description</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {txnLoading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-400">
                        <div className="w-5 h-5 border-2 border-[#3BA7F2] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading transaction ledger...
                      </td>
                    </tr>
                  ) : transactions && transactions.length > 0 ? (
                    transactions.map((tx) => {
                      const isCredit = tx.type === 'CREDIT';
                      const amtRupees = Number(tx.amountPaise) / 100;
                      const balRupees = Number(tx.balanceAfterPaise) / 100;
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-gray-800 dark:text-gray-200">
                            {tx.user?.email || `User #${tx.userId}`}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isCredit
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100'
                                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100'
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                            {tx.description || tx.referenceId || tx.referenceType}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-black ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isCredit ? '+' : '-'}₹{amtRupees.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-gray-800 dark:text-gray-200">
                            ₹{balRupees.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-400">
                        No transactions recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
              <span>Page {txnPage}</span>
              <div className="flex gap-2">
                <button
                  disabled={txnPage <= 1}
                  onClick={() => setTxnPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={transactions.length < 15}
                  onClick={() => setTxnPage((p) => p + 1)}
                  className="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: MANUAL WALLET AUDIT ADJUSTMENT */}
        {adjustModalOpen && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiSliders className="text-[#3BA7F2]" />
                  Manual Wallet Adjustment
                </h3>
                <button
                  onClick={() => setAdjustModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleManualAdjustment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Student User ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 42"
                    value={adjustData.userId}
                    onChange={(e) => setAdjustData({ ...adjustData, userId: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-gray-800 dark:text-white focus:outline-none focus:border-[#3BA7F2]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Action Type
                    </label>
                    <select
                      value={adjustData.type}
                      onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-gray-800 dark:text-white focus:outline-none"
                    >
                      <option value="CREDIT">CREDIT (+)</option>
                      <option value="DEBIT">DEBIT (-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Amount (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 100"
                      value={adjustData.amountRupees}
                      onChange={(e) => setAdjustData({ ...adjustData, amountRupees: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-gray-800 dark:text-white focus:outline-none focus:border-[#3BA7F2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Audit Reason
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Customer support reimbursement / test refund adjustment"
                    value={adjustData.reason}
                    onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-gray-800 dark:text-white focus:outline-none focus:border-[#3BA7F2]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={adjusting}
                    className="flex-1 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    {adjusting ? 'Processing...' : 'Apply Adjustment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}