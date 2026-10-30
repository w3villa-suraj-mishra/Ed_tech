import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  getReferralProfileAPI,
  getReferralNetworkAPI,
  getRewardSummaryAPI
} from '../../../services/operations/referralAPI';
import ReferralMetricsBanner from '../components/ReferralMetricsBanner';
import ReferralLinkShareCard from '../components/ReferralLinkShareCard';
import ReferralNetworkTree from '../components/ReferralNetworkTree';
import LevelEarningsBreakdown from '../components/LevelEarningsBreakdown';
import RewardLedgerTable from '../components/RewardLedgerTable';
import WalletTransactionsTable from '../components/WalletTransactionsTable';
import { FiUsers, FiAward, FiLayers, FiCreditCard } from 'react-icons/fi';

export default function ReferralDashboard() {
  const { token } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [network, setNetwork] = useState(null);
  const [rewardSummary, setRewardSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'network' | 'tiers' | 'ledger' | 'wallet'

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [profileRes, networkRes, rewardRes] = await Promise.all([
        getReferralProfileAPI(token),
        getReferralNetworkAPI(token),
        getRewardSummaryAPI(token)
      ]);
      setProfile(profileRes);
      setNetwork(networkRes);
      setRewardSummary(rewardRes);
    } catch (err) {
      console.error('Failed to load referral dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  return (
    <div className="space-y-6 text-[#1E293B] font-sans pb-16 max-w-[1240px] mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#3BA7F2]">
            <FiUsers className="text-lg" />
          </div>
          <h1 className="text-2xl sm:text-[28px] font-black text-[#0F172A] tracking-tight leading-tight">
            Referrals & Reward Center
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-normal pl-10.5">
          Invite friends, build your 4-level student network, and earn instant bonuses and lifetime course commissions.
        </p>
      </div>

      {/* Top 4 Metrics Cards */}
      <ReferralMetricsBanner profile={profile} earnings={rewardSummary?.earnings} />

      {/* Share Link Card */}
      <ReferralLinkShareCard profile={profile} />

      {/* Secondary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 pb-2 overflow-x-auto custom-scrollbar">
        {[
          { key: 'overview', label: 'Network Tree', icon: <FiUsers /> },
          { key: 'tiers', label: 'Commission Tiers (L1-L4)', icon: <FiAward /> },
          { key: 'ledger', label: 'Reward Ledger', icon: <FiLayers /> },
          { key: 'wallet', label: 'Wallet Transactions', icon: <FiCreditCard /> }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#3BA7F2] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#0F172A] hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <ReferralNetworkTree networkData={network} />
      )}

      {activeTab === 'tiers' && (
        <LevelEarningsBreakdown earnings={rewardSummary?.earnings} />
      )}

      {activeTab === 'ledger' && (
        <RewardLedgerTable token={token} />
      )}

      {activeTab === 'wallet' && (
        <WalletTransactionsTable token={token} />
      )}
    </div>
  );
}

