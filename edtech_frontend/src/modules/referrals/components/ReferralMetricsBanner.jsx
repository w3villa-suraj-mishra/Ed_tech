import React from 'react';
import { FiGift, FiUsers, FiAward, FiDollarSign } from 'react-icons/fi';

export default function ReferralMetricsBanner({ profile, earnings }) {
  const availableRupees = profile?.stats?.availableRewardRupees ?? 0;
  const lifetimeRupees = profile?.stats?.lifetimeEarnedRupees ?? earnings?.totalEarnedRupees ?? 0;
  const directCount = profile?.stats?.directReferralCount ?? 0;
  const totalNetworkCount = profile?.stats?.totalNetworkCount ?? 0;

  const cards = [
    {
      title: 'Available Reward Balance',
      value: `₹${availableRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Ready to spend on course checkout',
      icon: <FiGift className="text-xl sm:text-2xl text-emerald-600" />,
      bg: 'bg-emerald-50/80 border-emerald-100',
      badge: 'Course Credit'
    },
    {
      title: 'Direct Referrals',
      value: directCount,
      subtitle: 'Level 1 direct students referred',
      icon: <FiUsers className="text-xl sm:text-2xl text-[#3BA7F2]" />,
      bg: 'bg-sky-50/80 border-sky-100',
      badge: '10% Commission'
    },
    {
      title: 'Total Network Size',
      value: totalNetworkCount,
      subtitle: 'Across Levels 1 to 4 downline',
      icon: <FiAward className="text-xl sm:text-2xl text-indigo-600" />,
      bg: 'bg-indigo-50/80 border-indigo-100',
      badge: '4-Tier Deep'
    },
    {
      title: 'Lifetime Rewards Earned',
      value: `₹${lifetimeRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Total commissions & bonuses',
      icon: <FiDollarSign className="text-xl sm:text-2xl text-amber-600" />,
      bg: 'bg-amber-50/80 border-amber-100',
      badge: 'All-Time'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((c, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${c.bg}`}>
              {c.icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {c.badge}
            </span>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {c.title}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1 tracking-tight">
              {c.value}
            </div>
            <p className="text-xs text-gray-500 mt-1 font-normal">
              {c.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

