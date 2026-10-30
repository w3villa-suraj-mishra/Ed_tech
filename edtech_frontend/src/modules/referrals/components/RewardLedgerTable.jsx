import React, { useState, useEffect } from 'react';
import { getRewardHistoryAPI } from '../../../services/operations/referralAPI';
import { FiClock, FiCheckCircle, FiRotateCcw, FiLayers } from 'react-icons/fi';

export default function RewardLedgerTable({ token }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchHistory = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getRewardHistoryAPI(token, page, 8, statusFilter || null);
      setRewards(res.rewards || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || 0);
    } catch (err) {
      console.error('Failed to load reward history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token, page, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Available</span>;
      case 'USED':
        return <span className="bg-sky-50 text-[#3BA7F2] border border-sky-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Redeemed</span>;
      case 'REVERSED':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Reversed</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Reward Ledger History
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
            Audit trail of verified registration bonuses, course purchase commissions, and reversals.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          {['', 'AVAILABLE', 'USED', 'REVERSED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#3BA7F2] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
              }`}
            >
              {st === '' ? 'All' : st === 'AVAILABLE' ? 'Available' : st === 'USED' ? 'Redeemed' : 'Reversed'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading ledger records...</div>
      ) : rewards.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="text-2xl text-gray-400">📋</div>
          <p className="text-xs font-semibold text-gray-500">No reward records found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200/70 text-gray-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Event</th>
                <th className="pb-3">Tier</th>
                <th className="pb-3">Reference</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rewards.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3.5 pl-2 font-bold text-[#0F172A]">
                    {r.rewardType === 'REGISTRATION' ? 'Registration Bonus' : 'Purchase Commission'}
                  </td>
                  <td className="py-3.5">
                    {r.referralLevel ? (
                      <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] border border-indigo-100">
                        Level {r.referralLevel}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 font-mono text-[11px] text-gray-500">
                    {r.orderId ? r.orderId.slice(0, 16) + '...' : 'Direct Signup'}
                  </td>
                  <td className="py-3.5 text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5">
                    {getStatusBadge(r.status)}
                  </td>
                  <td className="py-3.5 text-right pr-2 font-black text-sm text-[#0F172A]">
                    +₹{r.amountRupees.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs">
          <span className="text-gray-500">
            Page {page} of {totalPages} ({totalRecords} records)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

