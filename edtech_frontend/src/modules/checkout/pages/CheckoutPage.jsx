import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useCheckout from '../hooks/useCheckout';
import PaymentStatusModal from '../components/PaymentStatusModal';
import CheckoutConfirmationModal from '../components/CheckoutConfirmationModal';
import StripePaymentModal from '../components/StripePaymentModal';
import { FiChevronDown, FiChevronUp, FiCheck, FiX, FiShield, FiLayers, FiBookOpen, FiAward, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Selected course passed via state (e.g. from Buy Course button) or cart
  const directCourse = location.state?.directCourse;
  const directCourses = directCourse ? [directCourse] : null;

  const {
    customerDetails,
    errors,
    loading,
    stripeModal,
    setStripeModal,
    statusModal,
    setStatusModal,
    handleInputChange,
    initiatePayment,
    handleStripePaymentSuccess,
    handleStripePaymentFailure,
    handleStripePaymentCancel,
    coursesToCheckout
  } = useCheckout(directCourses);

  const primaryCourse = coursesToCheckout[0] || directCourse || null;

  // Selected plan: 'basic' | 'plus' | 'pro'
  const [selectedPlan, setSelectedPlan] = useState('plus');

  // Left column expanded accordion states
  const [expandedPlan, setExpandedPlan] = useState('plus');

  // Coupon state: Dynamic initial state (check URL query param, location.state or primaryCourse)
  const urlParams = new URLSearchParams(window.location.search);
  const promoFromUrl = urlParams.get('code') || urlParams.get('coupon');
  const promoObjFromUrl = promoFromUrl?.toUpperCase() === 'GANDHI30' 
    ? { code: 'GANDHI30', discountPercent: 30 } 
    : promoFromUrl?.endsWith('30')
      ? { code: promoFromUrl.toUpperCase(), discountPercent: 30 }
      : null;

  const initialCoupon = location.state?.appliedCoupon || 
    promoObjFromUrl ||
    primaryCourse?.activeCoupon || 
    primaryCourse?.coupon || 
    null;
  const [appliedCoupon, setAppliedCoupon] = useState(initialCoupon);
  const [couponInput, setCouponInput] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Dynamic Prices based on primary course or fallback
  const basePrice = Number(primaryCourse?.price || primaryCourse?.pricing?.finalPrice || 4999);
  const planPrices = {
    basic: Number(primaryCourse?.planPrices?.basic || primaryCourse?.pricing?.basicPrice || Math.round(basePrice * 0.1) || 499),
    plus: Number(primaryCourse?.planPrices?.plus || primaryCourse?.pricing?.plusPrice || basePrice || 4999),
    pro: Number(primaryCourse?.planPrices?.pro || primaryCourse?.pricing?.proPrice || Math.round(basePrice * 1.4) || 6999),
  };

  const currentPlanPrice = planPrices[selectedPlan] || basePrice;
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountAmount = Math.round((currentPlanPrice * discountPercent) / 100);
  const finalPrice = Math.max(0, currentPlanPrice - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const code = couponInput.trim().toUpperCase();
    if (code === 'GANDHI30' || code === 'GANDHI') {
      setAppliedCoupon({ code, discountPercent: 30 });
      toast.success(`Coupon "${code}" applied successfully! (30% OFF)`);
      setCouponInput('');
    } else if (code === 'LUCKY20' || code === 'WELCOME20' || code === 'CODEHELP20') {
      setAppliedCoupon({ code, discountPercent: 20 });
      toast.success(`Coupon "${code}" applied successfully! (20% OFF)`);
      setCouponInput('');
    } else if (code === 'SUPER50' || code === 'HALFOFF') {
      setAppliedCoupon({ code, discountPercent: 50 });
      toast.success(`Coupon "${code}" applied successfully! (50% OFF)`);
      setCouponInput('');
    } else if (code.endsWith('30')) {
      setAppliedCoupon({ code, discountPercent: 30 });
      toast.success(`Coupon "${code}" applied successfully! (30% OFF)`);
      setCouponInput('');
    } else if (code.endsWith('20')) {
      setAppliedCoupon({ code, discountPercent: 20 });
      toast.success(`Coupon "${code}" applied successfully! (20% OFF)`);
      setCouponInput('');
    } else if (code.endsWith('50')) {
      setAppliedCoupon({ code, discountPercent: 50 });
      toast.success(`Coupon "${code}" applied successfully! (50% OFF)`);
      setCouponInput('');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const handleCheckoutClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmAndPay = () => {
    setShowConfirmModal(false);
    initiatePayment(selectedPlan, appliedCoupon?.code);
  };

  if (coursesToCheckout.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-gray-800 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="text-4xl">🛍️</div>
        <h2 className="text-2xl font-extrabold text-[#0F172A]">No items in checkout</h2>
        <p className="text-xs text-gray-500 max-w-sm font-normal">
          Please add a course to your cart or select a course to purchase.
        </p>
        <button
          onClick={() => navigate('/courses')}
          className="px-6 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white font-bold text-xs transition cursor-pointer shadow-md shadow-sky-500/20"
        >
          Explore Courses
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800 font-sans flex flex-col items-center justify-center p-4 py-8 sm:py-12">
      <div className="max-w-4xl w-full space-y-4">
        
        {/* RETURN BUTTON ALIGNED TO LEFT EDGE OF CARD */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 hover:text-gray-900 transition border border-gray-200 shadow-2xs cursor-pointer"
          >
            <FiChevronLeft className="text-sm text-gray-500" />
            <span>Return</span>
          </button>
        </div>

        {/* MAIN CARD CONTAINER */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 space-y-6">
          
          {/* Header Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Upgrade to {primaryCourse?.courseName || primaryCourse?.title || "Codehelp One"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
              Do more with unlimited access to codehelp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: PLAN ACCORDIONS */}
            <div className="md:col-span-6 space-y-4 md:border-r md:border-gray-200 md:pr-6">
              
              {/* 1. Basic Plan Card */}
              <div
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlan === 'basic'
                    ? 'bg-sky-50/60 border-[#3BA7F2] shadow-xs'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div
                  onClick={() => {
                    setSelectedPlan('basic');
                    setExpandedPlan(expandedPlan === 'basic' ? null : 'basic');
                  }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A]">Basic Plan</h3>
                    <p className="text-xs text-gray-500 mt-0.5">1 month access</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-[#0F172A]">
                      ₹{planPrices.basic.toLocaleString()}.00
                    </span>
                    {expandedPlan === 'basic' ? <FiChevronUp className="text-gray-400 text-sm" /> : <FiChevronDown className="text-gray-400 text-sm" />}
                  </div>
                </div>

                {expandedPlan === 'basic' && (
                  <div className="mt-4 pt-3 border-t border-gray-200/80 space-y-2.5 text-xs text-gray-600 animate-in fade-in duration-150">
                    <p className="text-[#3BA7F2] font-semibold">Monthly paid plan.</p>
                    <p className="font-bold text-[#0F172A]">This subscription includes:</p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-2"><FiLayers className="text-[#3BA7F2]" /> All Course Access (DSA + more)</li>
                      <li className="flex items-center gap-2"><FiBookOpen className="text-[#3BA7F2]" /> Core CS Subjects</li>
                      <li className="flex items-center gap-2"><FiAward className="text-[#3BA7F2]" /> Mock Tests</li>
                      <li className="flex items-center gap-2"><FiCheck className="text-[#3BA7F2]" /> Coding Contest</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* 2. Plus Plan Card */}
              <div
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlan === 'plus'
                    ? 'bg-sky-50/60 border-[#3BA7F2] shadow-xs'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div
                  onClick={() => {
                    setSelectedPlan('plus');
                    setExpandedPlan(expandedPlan === 'plus' ? null : 'plus');
                  }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A]">Plus Plan</h3>
                    <p className="text-xs text-gray-500 mt-0.5">1 year access</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-[#0F172A]">
                      ₹{planPrices.plus.toLocaleString()}.00
                    </span>
                    {expandedPlan === 'plus' ? <FiChevronUp className="text-gray-400 text-sm" /> : <FiChevronDown className="text-gray-400 text-sm" />}
                  </div>
                </div>

                {expandedPlan === 'plus' && (
                  <div className="mt-4 pt-3 border-t border-gray-200/80 space-y-2.5 text-xs text-gray-600 animate-in fade-in duration-150">
                    <p className="text-[#3BA7F2] font-semibold">1 year paid plan.</p>
                    <p className="font-bold text-[#0F172A]">This subscription includes:</p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-2"><FiLayers className="text-[#3BA7F2]" /> All Course Access (DSA + more)</li>
                      <li className="flex items-center gap-2"><FiBookOpen className="text-[#3BA7F2]" /> Core CS Subjects</li>
                      <li className="flex items-center gap-2"><FiAward className="text-[#3BA7F2]" /> Mock Tests</li>
                      <li className="flex items-center gap-2"><FiCheck className="text-[#3BA7F2]" /> Coding Contest</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* 3. Pro Plan Card */}
              <div
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlan === 'pro'
                    ? 'bg-sky-50/60 border-[#3BA7F2] shadow-xs'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div
                  onClick={() => {
                    setSelectedPlan('pro');
                    setExpandedPlan(expandedPlan === 'pro' ? null : 'pro');
                  }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A]">Pro Plan</h3>
                    <p className="text-xs text-gray-500 mt-0.5">2 years access</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-[#0F172A]">
                      ₹{planPrices.pro.toLocaleString()}.00
                    </span>
                    {expandedPlan === 'pro' ? <FiChevronUp className="text-gray-400 text-sm" /> : <FiChevronDown className="text-gray-400 text-sm" />}
                  </div>
                </div>

                {expandedPlan === 'pro' && (
                  <div className="mt-4 pt-3 border-t border-gray-200/80 space-y-2.5 text-xs text-gray-600 animate-in fade-in duration-150">
                    <p className="text-[#3BA7F2] font-semibold">2 year paid plan.</p>
                    <p className="font-bold text-[#0F172A]">This subscription includes:</p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-2"><FiLayers className="text-[#3BA7F2]" /> All Course Access (DSA + more)</li>
                      <li className="flex items-center gap-2"><FiBookOpen className="text-[#3BA7F2]" /> Core CS Subjects</li>
                      <li className="flex items-center gap-2"><FiAward className="text-[#3BA7F2]" /> Mock Tests</li>
                      <li className="flex items-center gap-2"><FiCheck className="text-[#3BA7F2]" /> Coding Contest</li>
                    </ul>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: BILLING OPTIONS & CHECKOUT */}
            <div className="md:col-span-6 space-y-5">
              
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Billing options
                </p>

                {/* Basic Option */}
                <label
                  onClick={() => setSelectedPlan('basic')}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    selectedPlan === 'basic'
                      ? 'bg-sky-50/60 border-[#3BA7F2]'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="billing_plan_select"
                      checked={selectedPlan === 'basic'}
                      onChange={() => setSelectedPlan('basic')}
                      className="w-4 h-4 accent-[#3BA7F2] cursor-pointer"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A]">Basic Plan</h4>
                      <p className="text-[11px] text-gray-500">1 month access</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-[#0F172A]">
                    ₹{planPrices.basic.toLocaleString()}.00
                  </span>
                </label>

                {/* Plus Option */}
                <label
                  onClick={() => setSelectedPlan('plus')}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    selectedPlan === 'plus'
                      ? 'bg-sky-50/60 border-[#3BA7F2]'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="billing_plan_select"
                      checked={selectedPlan === 'plus'}
                      onChange={() => setSelectedPlan('plus')}
                      className="w-4 h-4 accent-[#3BA7F2] cursor-pointer"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A]">Plus Plan</h4>
                      <p className="text-[11px] text-gray-500">1 year access</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-[#0F172A]">
                    ₹{planPrices.plus.toLocaleString()}.00
                  </span>
                </label>

                {/* Pro Option */}
                <label
                  onClick={() => setSelectedPlan('pro')}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    selectedPlan === 'pro'
                      ? 'bg-sky-50/60 border-[#3BA7F2]'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="billing_plan_select"
                      checked={selectedPlan === 'pro'}
                      onChange={() => setSelectedPlan('pro')}
                      className="w-4 h-4 accent-[#3BA7F2] cursor-pointer"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A]">Pro Plan</h4>
                      <p className="text-[11px] text-gray-500">2 years access</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-[#0F172A]">
                    ₹{planPrices.pro.toLocaleString()}.00
                  </span>
                </label>
              </div>

              {/* Price Row */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-medium text-gray-500">Price</span>
                <div className="flex items-center gap-2">
                  {discountPercent > 0 && (
                    <span className="text-xs text-gray-400 line-through font-medium">
                      ₹{currentPlanPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-2xl font-black text-[#0F172A]">
                    ₹{finalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500">Coupon</p>
                
                {appliedCoupon ? (
                  /* OFFER IS APPLIED/AVAILABLE: SHOW GREEN CARD WITH CODE, DISCOUNT & REMOVE X BUTTON */
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between animate-in fade-in duration-150">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold border border-emerald-200 shrink-0">
                        ✓
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-medium">
                          {appliedCoupon.discountPercent}% off — you save ₹{discountAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-gray-600 p-1 transition cursor-pointer"
                      title="Remove coupon"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  /* NO OFFER APPLIED: SHOW SIMPLE INPUT FIELD & APPLY BUTTON */
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo coupon code (e.g. LUCKY20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#3BA7F2]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Checkout Button & Security Footer */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 bg-[#3BA7F2] hover:bg-[#2895E0] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-sky-500/25 transition transform active:scale-[0.99] cursor-pointer"
                >
                  Checkout
                </button>

                <div className="text-center space-y-1">
                  <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1 font-medium">
                    <FiShield className="text-[#3BA7F2] text-xs" />
                    <span>Secure checkout via Stripe</span>
                  </p>
                  <p className="text-[10px] text-gray-400 font-normal">
                    Note: We have a strict no refund policy.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* CONFIRMATION MODAL (NAME & MOBILE NUMBER INPUT) */}
      <CheckoutConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        customerDetails={customerDetails}
        errors={errors}
        onChange={handleInputChange}
        onContinueToPayment={handleConfirmAndPay}
        loading={loading}
        selectedPlan={selectedPlan}
        finalTotal={finalPrice}
        subtotal={currentPlanPrice}
        discountAmount={discountAmount}
        appliedCoupon={appliedCoupon}
        courses={coursesToCheckout}
      />

      {/* STRIPE PAYMENT MODAL */}
      <StripePaymentModal
        isOpen={stripeModal?.isOpen}
        onClose={() => setStripeModal({ isOpen: false, paymentData: null })}
        paymentData={stripeModal?.paymentData}
        onPaymentSuccess={handleStripePaymentSuccess}
        onPaymentFailure={handleStripePaymentFailure}
        onPaymentCancel={handleStripePaymentCancel}
      />

      {/* PAYMENT STATUS MODAL */}
      <PaymentStatusModal
        modalData={statusModal}
        onClose={() => setStatusModal({ isOpen: false, status: 'idle', message: '' })}
        onRetry={handleConfirmAndPay}
      />
    </div>
  );
};

export default CheckoutPage;
