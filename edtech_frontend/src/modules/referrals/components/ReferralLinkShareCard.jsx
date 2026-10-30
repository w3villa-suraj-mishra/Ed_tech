import React, { useState } from 'react';
import { FiCopy, FiCheck, FiShare2, FiExternalLink, FiInfo } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ReferralLinkShareCard({ profile }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = profile?.referralCode || '...';
  const referralUrl = profile?.referralUrl || (typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${referralCode}` : '');

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      toast.success('Referral code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🚀 Hey! I'm learning on CodeLearn. Use my invite link to join, get verified, and explore top tech courses:\n\n${referralUrl}\n\nReferral Code: ${referralCode}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join CodeLearn via my referral link',
          text: `Use my invite link to get verified and unlock top courses on CodeLearn: ${referralCode}`,
          url: referralUrl,
        });
      } catch (err) {
        // User dismissed share dialog
      }
    } else {
      copyToClipboard(referralUrl, 'link');
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Share Your Referral Link
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
            Earn <span className="font-bold text-emerald-600">₹20</span> instant reward on verified signup, plus up to <span className="font-bold text-[#3BA7F2]">10% lifetime commission</span> on course purchases.
          </p>
        </div>

        {profile?.directReferrer && (
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs text-gray-600">
            <FiInfo className="text-[#3BA7F2]" />
            <span>Referred by: <strong className="text-[#0F172A]">{profile.directReferrer.name}</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Referral Code Box */}
        <div className="md:col-span-1 bg-gray-50/70 border border-gray-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Your Unique Code
          </div>
          <div className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
            <span className="font-mono font-black text-lg sm:text-xl text-[#0F172A] tracking-wider">
              {referralCode}
            </span>
            <button
              onClick={() => copyToClipboard(referralCode, 'code')}
              className="p-1.5 text-gray-400 hover:text-[#3BA7F2] transition cursor-pointer"
              title="Copy code"
            >
              {copiedCode ? <FiCheck className="text-emerald-500 text-lg" /> : <FiCopy className="text-lg" />}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-normal">
            Peers can also enter this code manually during signup.
          </p>
        </div>

        {/* Share Link Input & Instant Actions */}
        <div className="md:col-span-2 bg-gray-50/70 border border-gray-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Personalized Referral Link
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-gray-700 outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(referralUrl, 'link')}
                className="px-4 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs sm:text-sm font-bold transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              >
                {copiedLink ? <FiCheck /> : <FiCopy />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FaWhatsapp className="text-sm" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FiShare2 className="text-sm" />
              <span>Share Link</span>
            </button>

            <a
              href={referralUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <FiExternalLink className="text-xs" />
              <span>Test Link</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

