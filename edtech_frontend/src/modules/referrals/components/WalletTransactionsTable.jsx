import React, { useState, useEffect } from 'react';
import { getWalletTransactionsAPI } from '../../../services/operations/referralAPI';
import { FiArrowDownLeft, FiArrowUpRight, FiRotateCcw } from 'react-icons/fi';

export default function WalletTransactionsTable({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getWalletTransactionsAPI(token, page, 8);
      setTransactions(res.transactions || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || 0);
    } catch (err) {
      console.error('Failed to load wallet transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token, page]);

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Wallet Credit & Debit Transactions
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
            Double-entry running balance ledger for reward bonuses and course checkout redemptions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading wallet ledger...</div>
      ) : transactions.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="text-2xl text-gray-400">💳</div>
          <p className="text-xs font-semibold text-gray-500">No wallet transactions yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200/70 text-gray-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Type</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Change</th>
                <th className="pb-3 text-right pr-2">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => {
                const isCredit = t.amountRupees > 0;
                return (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                            isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {isCredit ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                        </div>
                        <span className="font-bold text-[#0F172A]">
                          {t.transactionType === 'CREDIT_REWARD'
                            ? 'Reward Credit'
                            : t.transactionType === 'DEBIT_PURCHASE'
                            ? 'Course Redemption'
                            : 'Reversal'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-gray-600 max-w-xs truncate">
                      {t.description || 'Wallet transaction'}
                    </td>
                    <td className="py-3.5 text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`py-3.5 text-right font-black ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isCredit ? `+₹${t.amountRupees.toFixed(2)}` : `-₹${Math.abs(t.amountRupees).toFixed(2)}`}
                    </td>
                    <td className="py-3.5 text-right pr-2 font-black text-[#0F172A]">
                      ₹{t.balanceAfterRupees.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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

