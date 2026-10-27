import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiCheckCircle, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";
import { apiConnector } from "../../../services/apiConnector";
import { endpoints } from "../../../services/apis";
import { resetPassword } from "../../../services/operations/authAPI";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let cancelled = false;
    const verifyEmailLink = async () => {
      if (!token) {
        setVerifying(false);
        return;
      }
      try {
        const response = await apiConnector("GET", `${endpoints.VERIFY_RESETPASSTOKEN_API}/${encodeURIComponent(token)}`);
        if (!response.data?.success) throw new Error(response.data?.message || "Reset link is invalid or expired.");
        if (!cancelled) setVerified(true);
      } catch (error) {
        if (!cancelled) toast.error(error?.response?.data?.message || error.message || "Reset link is invalid or expired.");
      } finally {
        if (!cancelled) setVerifying(false);
      }
    };
    verifyEmailLink();
    return () => { cancelled = true; };
  }, [token]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters for your password.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    dispatch(resetPassword(password, confirmPassword, token, navigate));
  };

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:p-9">
        <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${verified ? "bg-emerald-50 text-emerald-600 ring-emerald-100" : "bg-indigo-50 text-indigo-600 ring-indigo-100"}`}>
          {verified ? <FiCheckCircle size={22} /> : <FiLock size={22} />}
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Create a new password</h1>
        {verifying ? (
          <p className="mt-3 text-sm text-slate-500">Verifying your email link…</p>
        ) : verified ? (
          <>
            <p className="mt-2 text-sm leading-6 text-slate-500">Email verified. Choose a strong password for your account.</p>
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <label className="block text-xs font-bold text-slate-700" htmlFor="new-password">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="-mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
              <label className="block text-xs font-bold text-slate-700" htmlFor="confirm-password">Confirm new password</label>
              <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter it again" className="-mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
                {loading ? "Updating password…" : "Save new password"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-slate-500">This verification link is missing, expired, or already used. Request a fresh link to continue.</p>
            <Link to="/forgot-password" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">Request another link</Link>
          </>
        )}
        {!verifying && verified && (
          <Link to="/login" className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-indigo-600"><FiArrowLeft /> Back to login</Link>
        )}
      </section>
    </main>
  );
}
