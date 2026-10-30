import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiUsers, FiAward } from 'react-icons/fi';

export default function ReferralNetworkTree({ networkData }) {
  const [collapsedLevels, setCollapsedLevels] = useState({
    level1: false,
    level2: false,
    level3: false,
    level4: false
  });

  const toggleLevel = (lvl) => {
    setCollapsedLevels((prev) => ({ ...prev, [lvl]: !prev[lvl] }));
  };

  const levelConfigs = [
    {
      key: 'level1',
      title: 'Level 1: Direct Referrals',
      rate: '10% Commission + ₹20 Reg Bonus',
      badgeColor: 'bg-sky-50 text-[#3BA7F2] border-sky-200',
      members: networkData?.network?.level1 || [],
      count: networkData?.level1Count || 0
    },
    {
      key: 'level2',
      title: 'Level 2: Second-Tier Network',
      rate: '5% Commission',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      members: networkData?.network?.level2 || [],
      count: networkData?.level2Count || 0
    },
    {
      key: 'level3',
      title: 'Level 3: Third-Tier Network',
      rate: '2% Commission',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      members: networkData?.network?.level3 || [],
      count: networkData?.level3Count || 0
    },
    {
      key: 'level4',
      title: 'Level 4: Fourth-Tier Network',
      rate: '1% Commission',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      members: networkData?.network?.level4 || [],
      count: networkData?.level4Count || 0
    }
  ];

  const totalMembers = networkData?.totalNetworkCount || 0;

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Referral Network Hierarchy
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
            Your 4-level deep earning downline. Expands automatically as your referred students invite their peers.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 text-[#3BA7F2] font-bold text-xs px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <FiUsers />
          <span>{totalMembers} Total Members</span>
        </div>
      </div>

      {totalMembers === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#3BA7F2] text-2xl shadow-xs">
            <FiUsers />
          </div>
          <h4 className="text-base font-bold text-[#0F172A]">No network members yet</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto font-normal">
            Share your unique referral link to invite friends. When they register and purchase courses, your hierarchy will appear right here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {levelConfigs.map((lvl) => {
            const isCollapsed = collapsedLevels[lvl.key];
            const hasMembers = lvl.members.length > 0;

            return (
              <div
                key={lvl.key}
                className="border border-gray-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs transition-all"
              >
                {/* Level Header Bar */}
                <button
                  type="button"
                  onClick={() => toggleLevel(lvl.key)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50/70 hover:bg-gray-100/60 transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">
                      {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronDown size={18} />}
                    </span>
                    <div>
                      <span className="font-extrabold text-sm sm:text-base text-[#0F172A]">
                        {lvl.title}
                      </span>
                      <span className="ml-2.5 text-xs text-gray-500 font-medium hidden sm:inline">
                        ({lvl.rate})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${lvl.badgeColor}`}>
                      {lvl.count} {lvl.count === 1 ? 'Student' : 'Students'}
                    </span>
                  </div>
                </button>

                {/* Level Members Body */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-5 border-t border-gray-100 bg-white">
                    {!hasMembers ? (
                      <div className="text-xs text-gray-400 py-3 text-center italic">
                        No students in this tier yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {lvl.members.map((m, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/60 border border-gray-200/70 hover:border-[#3BA7F2]/40 transition shadow-2xs"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3BA7F2] to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0 shadow-xs">
                              {m.name ? m.name.charAt(0) : 'S'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-xs sm:text-sm text-[#0F172A] truncate">
                                {m.name}
                              </h5>
                              <p className="text-[11px] text-gray-500 font-mono truncate">
                                {m.email}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                                <span>Joined {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'Recently'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

