import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiMail, FiShield } from "react-icons/fi";
import { getPasswordResetToken } from "../../../services/operations/authAPI";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const enteredEmail = String(new FormData(event.currentTarget).get("email") || "").trim();
    if (!enteredEmail) return;
    setEmail(enteredEmail);
    dispatch(getPasswordResetToken(enteredEmail, setEmailSent));
  };

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
          {emailSent ? <FiShield size={22} /> : <FiMail size={22} />}
        </div>
        {emailSent ? (
          <>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Check your inbox</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              If an account exists for <strong className="text-slate-700">{email}</strong>, we sent a secure link. Open it to verify your email and create a new password. Check your spam folder if it is not in your inbox.
            </p>
            {emailSent.previewUrl && (
              <a href={emailSent.previewUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100">
                Open development email preview
              </a>
            )}
            <button type="button" onClick={() => setEmailSent(null)} className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-700">
              Try another email
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Forgot your password?</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your account email. We’ll send you a secure verification link to choose a new password.
            </p>
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <label className="block text-xs font-bold text-slate-700" htmlFor="reset-email">Email address</label>
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="-mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
                {loading ? "Sending verification link…" : "Send verification link"}
              </button>
            </form>
          </>
        )}
        <Link to="/login" className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-indigo-600">
          <FiArrowLeft /> Back to login
        </Link>
      </section>
    </main>
  );
}
