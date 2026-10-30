import React from 'react';
import { FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

export default function LevelEarningsBreakdown({ earnings }) {
  const regRupees = earnings?.registrationRupees || 0;
  const l1Rupees = earnings?.level1Rupees || 0;
  const l2Rupees = earnings?.level2Rupees || 0;
  const l3Rupees = earnings?.level3Rupees || 0;
  const l4Rupees = earnings?.level4Rupees || 0;
  const totalRupees = earnings?.totalEarnedRupees || 0;

  const tiers = [
    {
      title: 'Registration Rewards',
      rate: '₹20 Flat per student',
      description: 'One-time reward when a referred friend completes verified email/OTP signup',
      earned: regRupees,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'Level 1: Direct Referrals',
      rate: '10% Commission',
      description: 'Earned every time your directly invited friends purchase or upgrade any course',
      earned: l1Rupees,
      color: 'bg-sky-50 text-[#3BA7F2] border-sky-200'
    },
    {
      title: 'Level 2: Second-Tier Downline',
      rate: '5% Commission',
      description: 'Earned when peers invited by your direct referrals purchase courses',
      earned: l2Rupees,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      title: 'Level 3: Third-Tier Downline',
      rate: '2% Commission',
      description: 'Earned from purchases made by 3rd-generation students in your network',
      earned: l3Rupees,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      title: 'Level 4: Fourth-Tier Downline',
      rate: '1% Commission',
      description: 'Earned from purchases made by 4th-generation students in your network',
      earned: l4Rupees,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  ];

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Commission Structure & Earnings
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
            Transparent breakdown of multi-level commission percentages and verified bonuses.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 self-start sm:self-auto">
          <FiTrendingUp />
          <span>Total: ₹{totalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiers.map((t, idx) => (
          <div
            key={idx}
            className="border border-gray-200/90 rounded-2xl p-5 bg-white shadow-2xs hover:border-[#3BA7F2]/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-[#0F172A]">{t.title}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${t.color}`}>
                  {t.rate}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal leading-relaxed">
                {t.description}
              </p>
            </div>

            <div className="border-t border-gray-100 mt-4 pt-3 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Earned so far</span>
              <span className="font-black text-base text-[#0F172A]">
                ₹{t.earned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

