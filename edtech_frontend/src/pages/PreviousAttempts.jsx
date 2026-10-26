import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { practiceEndpoints } from '../services/apis';
import { apiConnector } from '../services/apiConnector';

export default function PreviousAttempts() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchAttempts();
  }, [token]);

  const fetchAttempts = async () => {
    try {
      const res = await apiConnector('GET', practiceEndpoints.GET_USER_ATTEMPTS, null, {
        Authorization: `Bearer ${token}`
      });
      if (res.data?.success) {
        setAttempts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-richblack-900 text-white font-sans py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold">Previous Practice Attempts 📊</h1>
        <p className="text-xs text-richblack-300">Detailed record of all your practice tests and quizzes.</p>

        <div className="bg-[#111422] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-8 text-center text-xs text-richblack-300">Loading attempts history...</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-richblack-300 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Test Type</th>
                  <th className="px-5 py-3.5">Score</th>
                  <th className="px-5 py-3.5">Accuracy</th>
                  <th className="px-5 py-3.5">Time Spent</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {attempts.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-richblack-400">No attempts found yet.</td></tr>
                ) : (
                  attempts.map((a) => (
                    <tr key={a.id} className="hover:bg-white/5">
                      <td className="px-5 py-4 font-bold text-[#3BA7F2]">{a.testType}</td>
                      <td className="px-5 py-4 font-extrabold text-[#FFD60A]">{a.score} / {a.totalMarks}</td>
                      <td className="px-5 py-4 text-emerald-400 font-bold">{a.accuracy}%</td>
                      <td className="px-5 py-4 text-richblack-300">{Math.round(a.timeTaken / 60)} mins</td>
                      <td className="px-5 py-4 text-richblack-400">{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
