import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

export default function ConversationFilters({
  activeFilter = 'ALL',
  onFilterChange,
  searchTerm = '',
  onSearchChange,
  isSuperAdmin = false,
  adminsList = [],
  selectedAdmin = '',
  onAdminChange
}) {
  const tabs = [
    { key: 'ALL', label: 'All' },
    { key: 'UNASSIGNED', label: 'Unassigned' },
    { key: 'OPEN', label: 'Open' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'CLOSED', label: 'Closed' },
    { key: 'MY_CHATS', label: 'My Chats' }
  ];

  return (
    <div className="p-3 border-b border-gray-200 bg-white space-y-2.5">
      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by student name or email..."
          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-600 focus:bg-white transition"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Admin Assignee filter for Super Admin */}
      {isSuperAdmin && adminsList.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-gray-600">
          <FiFilter size={12} className="text-gray-400" />
          <span className="font-semibold">Assignee:</span>
          <select
            value={selectedAdmin}
            onChange={(e) => onAdminChange(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="">All Staff Members</option>
            <option value="UNASSIGNED">Unassigned Only</option>
            {adminsList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.firstName} {a.lastName} ({a.accountType})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
