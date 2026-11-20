import React, { useState, useEffect, useCallback } from 'react';
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
  FiX,
  FiInfo,
  FiArrowDown,
  FiGift,
  FiBookOpen
} from 'react-icons/fi';

export default function AdminReferrals() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'rules' | 'network' | 'audit'
  const [loading, setLoading] = useState(true);

  // Overview Data
  const [overview, setOverview] = useState(null);
  const [openEarningsUserId, setOpenEarningsUserId] = useState(null);

  // Rules Data
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

      const regRule = data?.find(r => r.rewardType === 'REGISTRATION');
      const l1Rule = data?.find(r => r.rewardType === 'COURSE_PURCHASE' && r.level === 1);
      const l2Rule = data?.find(r => r.rewardType === 'COURSE_PURCHASE' && r.level === 2);
      const l3Rule = data?.find(r => r.rewardType === 'COURSE_PURCHASE' && r.level === 3);
      const l4Rule = data?.find(r => r.rewardType === 'COURSE_PURCHASE' && r.level === 4);

      setRulesForm({
        registrationRewardRupees: regRule?.fixedAmountRupees != null
          ? Number(regRule.fixedAmountRupees)
          : (regRule?.fixedAmountPaise != null ? Number(regRule.fixedAmountPaise) / 100 : 20),
        l1Percentage: l1Rule ? Number(l1Rule.rewardPercentage) : 10,
        l2Percentage: l2Rule ? Number(l2Rule.rewardPercentage) : 5,
        l3Percentage: l3Rule ? Number(l3Rule.rewardPercentage) : 2,
        l4Percentage: l4Rule ? Number(l4Rule.rewardPercentage) : 1,
        maxRewardRupees: l1Rule?.maximumRewardRupees != null
          ? Number(l1Rule.maximumRewardRupees)
          : (l1Rule?.maximumRewardPaise != null ? Number(l1Rule.maximumRewardPaise) / 100 : 10000)
      });
    } catch (err) {
      console.warn('Failed to load rules:', err.message);
    }
  };

  const fetchTransactions = useCallback(async () => {
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
  }, [txnPage, txnTypeFilter]);

  useEffect(() => {
    fetchOverview();
    fetchRules();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchTransactions();
    }
  }, [activeTab, fetchTransactions]);

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
    const trimmedQuery = networkQuery.trim();
    if (!trimmedQuery) return;
    setNetworkLoading(true);
    try {
      let param = `q=${encodeURIComponent(trimmedQuery)}`;

      if (/^\d+$/.test(trimmedQuery)) {
        param = `studentId=${encodeURIComponent(trimmedQuery)}`;
      } else if (trimmedQuery.includes('@')) {
        param = `email=${encodeURIComponent(trimmedQuery.toLowerCase())}`;
      }

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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <FiShare2 size={18} />
              </span>
              Referrals & Rewards
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Configure 4-level commissions, inspect referral networks, and audit wallet rewards.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchOverview();
                fetchRules();
                if (activeTab === 'audit') fetchTransactions();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
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
        <div className="overflow-x-auto border-b border-slate-200 custom-scrollbar">
          <div className="flex min-w-max gap-1 sm:gap-2 text-sm font-semibold">
            {[
              { id: 'overview', label: 'Overview & Metrics', icon: FiActivity },
              { id: 'rules', label: 'Commission Rules', icon: FiSliders },
              { id: 'network', label: 'Network Explorer', icon: FiLayers },
              { id: 'audit', label: 'Wallet Ledger & Audit', icon: FiDollarSign }
            ].map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`mb-[-1px] px-3 py-3 rounded-t-lg border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-transparent bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="min-h-[150px] p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                  <span>Total Referrals</span>
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center"><FiUsers size={17} /></div>
                </div>
                <div className="mt-4"><span className="text-3xl font-black text-slate-900">{overview?.totalReferrals || 0}</span><span className="text-xs text-slate-500 block mt-1">Verified registrations linked</span></div>
              </div>

              <div className="min-h-[150px] p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                  <span>Commissions Paid</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><FiDollarSign size={17} /></div>
                </div>
                <div className="mt-4"><span className="text-3xl font-black text-emerald-600">₹{overview?.totalCommissionsPaidRupees?.toLocaleString() || 0}</span><span className="text-xs text-slate-500 block mt-1">Distributed to student wallets</span></div>
              </div>

              <div className="min-h-[150px] p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                  <span>Active Referrers</span>
                  <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center"><FiShare2 size={17} /></div>
                </div>
                <div className="mt-4"><span className="text-3xl font-black text-slate-900">{overview?.activeReferrersCount || 0}</span><span className="text-xs text-slate-500 block mt-1">Students who referred others</span></div>
              </div>

              <div className="min-h-[150px] p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                  <span>Commission Rates</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center"><FiSliders size={17} /></div>
                </div>
                <div className="mt-4">
                  <span className="text-base font-bold leading-6 text-slate-900">L1: {rulesForm.l1Percentage}% · L2: {rulesForm.l2Percentage}% · L3: {rulesForm.l3Percentage}% · L4: {rulesForm.l4Percentage}%</span>
                  <span className="text-xs text-slate-500 block mt-1">+ ₹{rulesForm.registrationRewardRupees} on direct registration</span>
                </div>
              </div>
            </div>

            {/* Leaderboard and Recent Referrals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leaderboard */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FiArrowUpRight className="text-emerald-600" />
                  Top Referrers
                </h3>
                <div className="divide-y divide-slate-100">
                  {overview?.topReferrers && overview.topReferrers.length > 0 ? (
                    overview.topReferrers.map((item, idx) => {
                      const isOpen = String(openEarningsUserId) === String(item.userId);
                      return (
                        <div key={item.userId || idx} className="py-2">
                          <button
                            type="button"
                            onClick={() => setOpenEarningsUserId(isOpen ? null : item.userId)}
                            className="w-full py-1 flex items-center justify-between text-xs text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-full bg-sky-50 text-sky-700 font-bold flex items-center justify-center text-[10px]">{idx + 1}</span>
                              <div>
                                <p className="font-semibold text-slate-800">{item.name || item.email || `Student #${item.userId}`}</p>
                                <p className="text-[10px] text-slate-500">{item.email}</p>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <div>
                                <span className="font-bold text-slate-900 block">{item.referralCount} referrals</span>
                                <span className="text-[10px] text-emerald-600 font-semibold">₹{item.totalEarnedRupees || 0} earned</span>
                              </div>
                              <span className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
                            </div>
                          </button>

                          {isOpen && (
                            <div className="mt-2 ml-9 mr-1 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                              {(item.earnings || []).length > 0 ? (
                                item.earnings.map((earning) => (
                                  <div key={earning.id} className="px-3 py-2.5 border-b last:border-b-0 border-slate-200 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="font-semibold text-slate-700">
                                        {earning.rewardType === 'REGISTRATION'
                                          ? `Referral used by ${earning.purchaserName || 'Student'}`
                                          : `Course bought by ${earning.purchaserName || 'Student'}${earning.courseName ? ` · ${earning.courseName}` : ''}`}
                                      </p>
                                      <p className="text-[10px] text-slate-500 truncate">{earning.sourceName || earning.orderId || 'Referral reward'}</p>
                                    </div>
                                    <span className="shrink-0 font-bold text-emerald-600">₹{earning.amountRupees}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="px-3 py-4 text-center text-[11px] text-slate-400">No reward entries found</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="py-8 text-center text-xs text-slate-400">No referral activity recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Referrals */}
              <div className="min-h-[220px] p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FiUsers className="text-sky-600" />
                  Recent Referral Links
                </h3>
                <div className="divide-y divide-slate-100">
                  {overview?.recentReferrals && overview.recentReferrals.length > 0 ? (
                    overview.recentReferrals.map((r, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {r.referredName || r.referredEmail || `User #${r.referredUserId}`}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Invited by: {r.referrerName || `Referrer #${r.referrerId}`} · Code: {r.referralCode}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Verified
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : 'Active'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-8 text-center text-xs text-slate-400">No recent referral records.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMMISSION RULES CONFIGURATION */}
        {activeTab === 'rules' && (
          <div className="max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-base font-bold text-slate-900">
                Referral Reward Policy & Commission Structure
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Rates configured here take immediate effect for all new verified registrations and course purchases.
              </p>
            </div>

            <form onSubmit={handleSaveRules} className="space-y-6">
              {/* Registration Rule */}
              <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                      Type A: Direct Registration Reward
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Awarded once upon initial verified student signup to direct referrer.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-700">
                    One-time flat bonus
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Direct Referrer Bonus (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={rulesForm.registrationRewardRupees}
                      onChange={(e) => setRulesForm({ ...rulesForm, registrationRewardRupees: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Level Purchase Rules */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Type B: Multi-Level Course Purchase Rewards
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Distributed hierarchically to eligible ancestors (up to 4 levels) on verified course payments.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Level 1 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Level 1: Direct Referrer (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={rulesForm.l1Percentage}
                      onChange={(e) => setRulesForm({ ...rulesForm, l1Percentage: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* Level 2 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Level 2: Grandparent (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={rulesForm.l2Percentage}
                      onChange={(e) => setRulesForm({ ...rulesForm, l2Percentage: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* Level 3 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Level 3: Great-Grandparent (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={rulesForm.l3Percentage}
                      onChange={(e) => setRulesForm({ ...rulesForm, l3Percentage: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* Level 4 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Level 4: Ancestor (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={rulesForm.l4Percentage}
                      onChange={(e) => setRulesForm({ ...rulesForm, l4Percentage: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Maximum Reward Cap per Transaction (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={rulesForm.maxRewardRupees}
                    onChange={(e) => setRulesForm({ ...rulesForm, maxRewardRupees: e.target.value })}
                    className="w-full sm:w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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

            {/* ─── HOW COMMISSION WORKS ─── */}
            <div className="mt-8 border-t border-slate-200 pt-6 space-y-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <FiInfo size={16} />
                </div>
                <h2 className="text-base font-bold text-slate-900">How Commission Works — Explained Simply</h2>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Our referral system rewards users across <strong>4 levels</strong> of the referral chain.
                There are <strong>two types</strong> of rewards:
              </p>

              {/* ── REWARD TYPE A: REGISTRATION ── */}
              <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <FiGift className="text-sky-600" size={15} />
                  <h3 className="text-sm font-bold text-sky-800">Reward Type A — Registration Bonus</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When a new student <strong>signs up</strong> using a referral code, the person who shared that code
                  (the <strong>Direct Referrer / Level 1 parent</strong>) receives a <strong>one-time flat bonus</strong>.
                </p>
                <div className="bg-white border border-sky-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <FiBookOpen size={12} className="text-sky-600" /> Example:
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px]">A</span>
                      <span className="font-semibold">Alice</span>
                      <span className="text-slate-400">shares her code →</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">B</span>
                      <span className="font-semibold">Bob signs up</span>
                    </div>
                  </div>
                  <div className="mt-3 pl-2 border-l-2 border-sky-300">
                    <p className="text-xs text-slate-700">
                      ✅ <strong>Alice (Level 1)</strong> receives <strong className="text-emerald-600">₹{rulesForm.registrationRewardRupees}</strong> flat bonus into her wallet.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Only the direct referrer is rewarded for registration. Upper-level ancestors do <em>not</em> receive registration bonuses.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── REWARD TYPE B: COURSE PURCHASE (MULTI-LEVEL) ── */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <FiDollarSign className="text-emerald-600" size={15} />
                  <h3 className="text-sm font-bold text-slate-800">Reward Type B — Course Purchase Commission (4 Levels)</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When <em>any</em> referred student <strong>purchases a course</strong>, commissions are automatically
                  distributed to <strong>up to 4 ancestors</strong> in the referral chain. Each ancestor receives a
                  <strong> percentage</strong> of the course price, based on their level in the tree.
                </p>

                {/* Chain diagram */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                  <p className="text-xs font-bold text-slate-800 mb-1">🔗 Referral Chain Example:</p>
                  <div className="flex flex-col items-center gap-1 text-xs">
                    <div className="px-4 py-2 rounded-lg bg-violet-50 border border-violet-200 text-center min-w-[200px]">
                      <span className="text-[10px] font-bold text-violet-600 uppercase">Level 4 — Great-Great-Grandparent</span>
                      <p className="font-bold text-slate-800 mt-0.5">👤 David</p>
                    </div>
                    <FiArrowDown className="text-slate-300" size={14} />
                    <div className="text-[10px] text-slate-400 italic">referred ↓</div>
                    <div className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-center min-w-[200px]">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Level 3 — Great-Grandparent</span>
                      <p className="font-bold text-slate-800 mt-0.5">👤 Charlie</p>
                    </div>
                    <FiArrowDown className="text-slate-300" size={14} />
                    <div className="text-[10px] text-slate-400 italic">referred ↓</div>
                    <div className="px-4 py-2 rounded-lg bg-sky-50 border border-sky-200 text-center min-w-[200px]">
                      <span className="text-[10px] font-bold text-sky-600 uppercase">Level 2 — Grandparent</span>
                      <p className="font-bold text-slate-800 mt-0.5">👤 Bob</p>
                    </div>
                    <FiArrowDown className="text-slate-300" size={14} />
                    <div className="text-[10px] text-slate-400 italic">referred ↓</div>
                    <div className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center min-w-[200px]">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Level 1 — Direct Parent</span>
                      <p className="font-bold text-slate-800 mt-0.5">👤 Alice</p>
                    </div>
                    <FiArrowDown className="text-slate-300" size={14} />
                    <div className="text-[10px] text-slate-400 italic">referred ↓</div>
                    <div className="px-5 py-3 rounded-xl border-2 border-orange-400 bg-orange-50 text-center min-w-[220px] shadow-sm">
                      <span className="text-[10px] font-bold text-orange-600 uppercase">🛒 Buyer</span>
                      <p className="font-bold text-slate-800 mt-0.5">👤 Eve buys a course for ₹1,000</p>
                    </div>
                  </div>
                </div>

                {/* Commission breakdown table */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                    <FiBookOpen size={12} className="text-emerald-600" /> Commission Breakdown (Course Price = ₹1,000):
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="py-2 px-3 font-bold text-slate-600">Level</th>
                          <th className="py-2 px-3 font-bold text-slate-600">Who Gets Paid</th>
                          <th className="py-2 px-3 font-bold text-slate-600">Relationship to Buyer</th>
                          <th className="py-2 px-3 font-bold text-slate-600 text-center">Commission Rate</th>
                          <th className="py-2 px-3 font-bold text-emerald-600 text-right">Reward (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="bg-emerald-50/40">
                          <td className="py-2.5 px-3"><span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-[10px] inline-flex">L1</span></td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">Alice</td>
                          <td className="py-2.5 px-3 text-slate-600">Direct Referrer (Parent)</td>
                          <td className="py-2.5 px-3 text-center font-bold text-sky-700">{rulesForm.l1Percentage}%</td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-600">₹{(1000 * Number(rulesForm.l1Percentage) / 100).toFixed(0)}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3"><span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-[10px] inline-flex">L2</span></td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">Bob</td>
                          <td className="py-2.5 px-3 text-slate-600">Grandparent (referred Alice)</td>
                          <td className="py-2.5 px-3 text-center font-bold text-sky-700">{rulesForm.l2Percentage}%</td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-600">₹{(1000 * Number(rulesForm.l2Percentage) / 100).toFixed(0)}</td>
                        </tr>
                        <tr className="bg-slate-50/40">
                          <td className="py-2.5 px-3"><span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-[10px] inline-flex">L3</span></td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">Charlie</td>
                          <td className="py-2.5 px-3 text-slate-600">Great-Grandparent (referred Bob)</td>
                          <td className="py-2.5 px-3 text-center font-bold text-sky-700">{rulesForm.l3Percentage}%</td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-600">₹{(1000 * Number(rulesForm.l3Percentage) / 100).toFixed(0)}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3"><span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 font-extrabold flex items-center justify-center text-[10px] inline-flex">L4</span></td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">David</td>
                          <td className="py-2.5 px-3 text-slate-600">Great-Great-Grandparent (referred Charlie)</td>
                          <td className="py-2.5 px-3 text-center font-bold text-sky-700">{rulesForm.l4Percentage}%</td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-600">₹{(1000 * Number(rulesForm.l4Percentage) / 100).toFixed(0)}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-300 bg-slate-50">
                          <td colSpan="3" className="py-2.5 px-3 font-bold text-slate-700">Total Commission Payout</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                            {Number(rulesForm.l1Percentage) + Number(rulesForm.l2Percentage) + Number(rulesForm.l3Percentage) + Number(rulesForm.l4Percentage)}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                            ₹{(1000 * (Number(rulesForm.l1Percentage) + Number(rulesForm.l2Percentage) + Number(rulesForm.l3Percentage) + Number(rulesForm.l4Percentage)) / 100).toFixed(0)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Max cap note */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                  <FiInfo className="text-amber-500 shrink-0 mt-0.5" size={14} />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-amber-700">Maximum Reward Cap:</strong> Each individual commission payout is capped at
                    <strong className="text-amber-700"> ₹{Number(rulesForm.maxRewardRupees).toLocaleString()}</strong> per transaction.
                    For example, if Level 1 earns {rulesForm.l1Percentage}% on a ₹{(Number(rulesForm.maxRewardRupees) / (Number(rulesForm.l1Percentage) / 100) * 2).toLocaleString(undefined, {maximumFractionDigits: 0})} course,
                    the calculated reward would exceed the cap, so only ₹{Number(rulesForm.maxRewardRupees).toLocaleString()} is credited.
                  </div>
                </div>
              </div>

              {/* ── KEY RULES ── */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FiInfo className="text-sky-600" size={14} />
                  Key Rules to Remember
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                    <span><strong>Registration bonus</strong> is a one-time flat amount paid only to the <strong>direct referrer (Level 1)</strong>. No multi-level payout for signups.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                    <span><strong>Course purchase commissions</strong> flow upward through <strong>4 levels</strong> of the referral tree. Each ancestor gets their configured percentage.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                    <span>If a referral chain has <strong>fewer than 4 levels</strong>, only the existing ancestors receive commission. No reward is "wasted" — it simply doesn't apply.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                    <span>Rewards are <strong>instantly credited</strong> to the user's wallet with status <strong>"AVAILABLE"</strong> and can be used for future purchases.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">⚠</span>
                    <span>If a purchase is <strong>refunded</strong>, the corresponding referral rewards are <strong>reversed</strong> from each ancestor's wallet.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                    <span>Changes to commission rates take <strong>immediate effect</strong> for all new transactions. Already-paid rewards are not retroactively adjusted.</span>
                  </li>
                </ul>
              </div>

              {/* ── QUICK REFERENCE SUMMARY ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-bold uppercase text-sky-600 tracking-wider">On Registration</p>
                  <p className="text-2xl font-black text-sky-700 mt-1">₹{rulesForm.registrationRewardRupees}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Flat bonus → Direct referrer only</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">On Course Purchase</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {rulesForm.l1Percentage}% → {rulesForm.l2Percentage}% → {rulesForm.l3Percentage}% → {rulesForm.l4Percentage}%
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">L1 → L2 → L3 → L4 (up to 4 ancestors)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NETWORK EXPLORER */}
        {activeTab === 'network' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-2">Student Referral Network Explorer</h2>
              <p className="text-xs text-slate-500 mb-4">
                Inspect a student's full ancestor chain and downline referrals.
              </p>

              <form onSubmit={handleSearchNetwork} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search student name, email or ID..."
                    value={networkQuery}
                    onChange={(e) => setNetworkQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={networkLoading}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {networkLoading ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>

            {networkData && (
              <>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <FiLayers className="text-sky-600" /> Referral Tree
                </h3>
                <div className="overflow-x-auto custom-scrollbar pb-2">
                  <div className="min-w-[620px] flex flex-col items-center gap-4">
                    {networkData.ancestors?.length > 0 && (
                      <div className="flex flex-col items-center gap-3 w-full">
                        {[...networkData.ancestors].reverse().map((anc, idx) => (
                          <React.Fragment key={anc.id || idx}>
                            <div className="px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50 text-center min-w-[220px]">
                              <p className="text-[10px] font-bold uppercase text-sky-600">{anc.depth === 1 ? 'Direct Parent' : `Ancestor Level ${anc.depth}`}</p>
                              <p className="text-xs font-bold text-slate-800 mt-0.5">{anc.name || anc.email || `User #${anc.id}`}</p>
                              <p className="text-[10px] text-slate-500">{anc.email}</p>
                            </div>
                            <div className="w-px h-4 bg-slate-300" />
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    <div className="px-5 py-3 rounded-xl border-2 border-sky-500 bg-sky-600 text-white text-center min-w-[240px] shadow-md">
                      <p className="text-[10px] font-bold uppercase text-sky-100">Selected Student</p>
                      <p className="text-sm font-bold mt-0.5">{networkData.user?.name || networkData.user?.email || 'Student'}</p>
                      <p className="text-[10px] text-sky-100">ID: {networkData.user?.id} · {networkData.user?.email}</p>
                    </div>

                    {networkData.downlines?.length > 0 ? (
                      <>
                        <div className="w-px h-5 bg-slate-300" />
                        <div className="flex flex-wrap justify-center gap-3">
                          {networkData.downlines.map((child, idx) => (
                            <div key={child.id || idx} className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-center min-w-[180px]">
                              <p className="text-[10px] font-bold uppercase text-emerald-600">Child Level {child.depth}</p>
                              <p className="text-xs font-bold text-slate-800 mt-0.5">{child.name || child.email || `User #${child.id}`}</p>
                              <p className="text-[10px] text-slate-500">{child.email}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-[11px] text-slate-400">No child referrals</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upline Ancestors */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                    <FiLayers className="text-sky-600" /> Upline Ancestors (Beneficiaries)
                  </h3>
                  {networkData.ancestors && networkData.ancestors.length > 0 ? (
                    <div className="space-y-2">
                      {networkData.ancestors.map((anc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-[10px]">L{anc.depth}</span>
                            <div>
                              <p className="font-bold text-slate-800">{anc.name || anc.email}</p>
                              <p className="text-[10px] text-slate-500">ID: {anc.id} · {anc.email}</p>
                            </div>
                          </div>
                          <span className="font-extrabold text-sky-700">
                            {anc.depth === 1 ? '10%' : anc.depth === 2 ? '5%' : anc.depth === 3 ? '2%' : '1%'} Cut
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">No upline ancestors found.</p>
                  )}
                </div>

                {/* Direct Downlines */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                    <FiUsers className="text-emerald-600" /> Direct Referred Students ({networkData.downlines?.length || 0})
                  </h3>
                  {networkData.downlines && networkData.downlines.length > 0 ? (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {networkData.downlines.map((child, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{child.name || child.email}</p>
                            <p className="text-[10px] text-slate-500">Joined: {child.registeredAt ? new Date(child.registeredAt).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Active Downline</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">This student has not referred any students yet.</p>
                  )}
                </div>
              </div>
              </>
            )}
          </div>
        )}

        {/* TAB 4: WALLET LEDGER & AUDIT */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Wallet Transactions Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Double-entry immutable record of all reward credits, debits, reversals, and deductions.
                </p>
              </div>

              <select
                value={txnTypeFilter}
                onChange={(e) => { setTxnTypeFilter(e.target.value); setTxnPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-sky-500"
              >
                <option value="">All Transaction Types</option>
                <option value="CREDIT">Credits Only</option>
                <option value="DEBIT">Debits Only</option>
                <option value="REVERSAL">Reversals Only</option>
              </select>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Reference / Description</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {txnLoading ? (
                    <tr><td colSpan="6" className="py-8 text-center text-slate-400"><div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />Loading transaction ledger...</td></tr>
                  ) : transactions && transactions.length > 0 ? (
                    transactions.map((tx) => {
                      const isCredit = tx.transactionType === 'CREDIT' || tx.type === 'CREDIT' || (tx.transactionType || '').includes('CREDIT');
                      const amtRupees = tx.amountRupees != null ? Number(tx.amountRupees) : Number(tx.amountPaise || 0) / 100;
                      const balRupees = tx.balanceAfterRupees != null ? Number(tx.balanceAfterRupees) : Number(tx.balanceAfterPaise || 0) / 100;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{tx.user?.email || `User #${tx.userId}`}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isCredit ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                              {tx.transactionType || tx.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{tx.description || tx.referenceId || tx.referenceType}</td>
                          <td className={`py-2.5 px-3 text-right font-black ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>{isCredit ? '+' : '-'}₹{amtRupees.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800">₹{balRupees.toLocaleString()}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="6" className="py-8 text-center text-slate-400">No transactions recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <span>Page {txnPage}</span>
              <div className="flex gap-2">
                <button disabled={txnPage <= 1} onClick={() => setTxnPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40">Previous</button>
                <button disabled={transactions.length < 15} onClick={() => setTxnPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40">Next</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: MANUAL WALLET AUDIT ADJUSTMENT */}
        {adjustModalOpen && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FiSliders className="text-sky-600" /> Manual Wallet Adjustment
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
                  <label className="block font-semibold text-slate-700 mb-1">
                    Student User ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 42"
                    value={adjustData.userId}
                    onChange={(e) => setAdjustData({ ...adjustData, userId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-[#3BA7F2]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Action Type
                    </label>
                    <select
                      value={adjustData.type}
                      onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    >
                      <option value="CREDIT">CREDIT (+)</option>
                      <option value="DEBIT">DEBIT (-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Amount (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 100"
                      value={adjustData.amountRupees}
                      onChange={(e) => setAdjustData({ ...adjustData, amountRupees: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-[#3BA7F2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Audit Reason
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Customer support reimbursement / test refund adjustment"
                    value={adjustData.reason}
                    onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-[#3BA7F2]"
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
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
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