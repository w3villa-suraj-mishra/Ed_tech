import React from 'react';
import { FiUser, FiPhone, FiLock, FiX } from 'react-icons/fi';

const CheckoutConfirmationModal = ({
  isOpen,
  onClose,
  customerDetails,
  errors,
  onChange,
  onContinueToPayment,
  loading,
  selectedPlan,
  finalTotal,
  subtotal,
  discountAmount,
  appliedCoupon,
  courses
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md sm:max-w-[420px] rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-2xl space-y-4 font-sans relative animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-extrabold uppercase bg-sky-50 text-[#3BA7F2] px-2.5 py-0.5 rounded-full border border-sky-100 tracking-wider">
              Confirm Order Details
            </span>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer -mr-1 shrink-0"
              title="Close modal"
            >
              <FiX size={16} />
            </button>
          </div>
          <h3 className="text-lg font-extrabold text-[#0F172A] mt-2 tracking-tight leading-snug">
            Customer Information
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5 font-normal leading-relaxed">
            Please enter/confirm your full name and mobile number to proceed to secure payment.
          </p>
        </div>

        {/* FORM INPUTS */}
        <div className="space-y-3">
          {/* NAME INPUT */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-[#0F172A] uppercase tracking-wider">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Enter your full name"
                value={customerDetails?.name || ''}
                onChange={(e) => onChange('name', e.target.value)}
                disabled={loading}
                className={`w-full bg-slate-50/80 border rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#0F172A] placeholder-gray-400 focus:bg-white focus:outline-none transition ${
                  errors?.name
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-gray-200 focus:border-[#3BA7F2]'
                }`}
              />
            </div>
            {errors?.name && (
              <p className="text-[10px] text-rose-500 font-medium pt-0.5">⚠️ {errors.name}</p>
            )}
          </div>

          {/* MOBILE NUMBER INPUT */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-[#0F172A] uppercase tracking-wider">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={customerDetails?.phone || ''}
                onChange={(e) => onChange('phone', e.target.value)}
                disabled={loading}
                className={`w-full bg-slate-50/80 border rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#0F172A] placeholder-gray-400 focus:bg-white focus:outline-none transition ${
                  errors?.phone
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-gray-200 focus:border-[#3BA7F2]'
                }`}
              />
            </div>
            {errors?.phone && (
              <p className="text-[10px] text-rose-500 font-medium pt-0.5">⚠️ {errors.phone}</p>
            )}
          </div>
        </div>

        {/* ORDER & PRICE BREAKDOWN CARD */}
        <div className="bg-slate-50/80 border border-gray-200/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-gray-600">
            <span>Selected Plan</span>
            <span className="font-extrabold text-[10px] text-[#0F172A] uppercase bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
              {selectedPlan || 'Plus Plan'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-600">
            <span>Subtotal ({courses?.length || 1} course)</span>
            <span className="font-extrabold text-[11px] text-[#0F172A]">₹{Number(subtotal || 0).toLocaleString()}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-[11px] text-emerald-600 font-semibold">
              <span>Offer Savings ({appliedCoupon?.code || 'OFFER'})</span>
              <span>-₹{Number(discountAmount || 0).toLocaleString()}</span>
            </div>
          )}

          <div className="border-t border-gray-200/80 pt-2 flex items-center justify-between">
            <span className="font-extrabold text-xs text-[#0F172A]">Payable Amount</span>
            <span className="font-black text-lg text-[#0F172A]">
              ₹{Number(finalTotal || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-2 pt-0.5">
          <button
            onClick={onContinueToPayment}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Opening Gateway...</span>
              </div>
            ) : (
              <>
                <FiLock className="text-xs" />
                <span>Continue to Payment</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-1 text-center text-[11px] text-gray-500 hover:text-gray-800 font-semibold transition cursor-pointer block"
          >
            Cancel and Return
          </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutConfirmationModal;
