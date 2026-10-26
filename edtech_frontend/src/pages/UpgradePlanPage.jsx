import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiArrowLeft, FiCheck, FiX, FiShield, FiLayers, FiBookOpen, FiAward } from "react-icons/fi";
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI";
import { buyCourse } from "../services/operations/studentFeaturesAPI";
import toast from "react-hot-toast";

const UpgradePlanPage = () => {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const [course, setCourse] = useState(null);
  const [, setLoading] = useState(false);

  // Selected billing plan: 'basic' | 'plus' | 'pro'
  const [selectedPlan, setSelectedPlan] = useState("plus");

  // Coupon state: Dynamic initial state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const effectiveCourseId = courseId || searchParams.get("courseId");

  useEffect(() => {
    if (effectiveCourseId) {
      setLoading(true);
      fetchCourseDetails(effectiveCourseId)
        .then((res) => {
          const courseData = res?.courseDetails || res?.data?.courseDetails || res;
          if (courseData) {
            setCourse(courseData);
            if (courseData?.activeCoupon || courseData?.coupon) {
              const c = courseData.activeCoupon || courseData.coupon;
              setAppliedCoupon({
                code: c.code || c.couponCode || "LUCKY20",
                discountPercent: c.discountPercent || c.discount || 20,
                active: true,
              });
            }
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [effectiveCourseId]);

  // Dynamic Plan Prices (Fallback to standard defaults if course price not set)
  const basePrice = Number(course?.price || 4999);
  const planPrices = {
    basic: Number(course?.planPrices?.basic || course?.pricing?.basicPrice || Math.round(basePrice * 0.1) || 499),
    plus: Number(course?.planPrices?.plus || course?.pricing?.plusPrice || basePrice || 4999),
    pro: Number(course?.planPrices?.pro || course?.pricing?.proPrice || Math.round(basePrice * 1.4) || 6999),
  };

  const currentPlanPrice = planPrices[selectedPlan] || 4999;
  const discountPercent = appliedCoupon?.active ? appliedCoupon.discountPercent : 0;
  const discountAmount = Math.round((currentPlanPrice * discountPercent) / 100);
  const finalPrice = Math.max(0, currentPlanPrice - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    if (!couponInput.trim()) return;

    const code = couponInput.trim().toUpperCase();
    if (code === "GANDHI30" || code === "GANDHI") {
      setAppliedCoupon({ code, discountPercent: 30, active: true });
      toast.success(`Coupon "${code}" applied successfully! (30% OFF)`);
      setCouponInput("");
    } else if (code === "LUCKY20" || code === "CODEHELP20" || code === "WELCOME20") {
      setAppliedCoupon({ code, discountPercent: 20, active: true });
      toast.success(`Coupon "${code}" applied successfully! (20% OFF)`);
      setCouponInput("");
    } else if (code === "SUPER50" || code === "HALFOFF") {
      setAppliedCoupon({ code, discountPercent: 50, active: true });
      toast.success(`Coupon "${code}" applied successfully! (50% OFF)`);
      setCouponInput("");
    } else if (code.endsWith("30")) {
      setAppliedCoupon({ code, discountPercent: 30, active: true });
      toast.success(`Coupon "${code}" applied successfully! (30% OFF)`);
      setCouponInput("");
    } else if (code.endsWith("20")) {
      setAppliedCoupon({ code, discountPercent: 20, active: true });
      toast.success(`Coupon "${code}" applied successfully! (20% OFF)`);
      setCouponInput("");
    } else if (code.endsWith("50")) {
      setAppliedCoupon({ code, discountPercent: 50, active: true });
      toast.success(`Coupon "${code}" applied successfully! (50% OFF)`);
      setCouponInput("");
    } else {
      setCouponError("Invalid coupon code.");
      toast.error("Invalid coupon code.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed.");
  };

  const handleCheckout = () => {
    if (!token) {
      toast.error("Please login to proceed with checkout.");
      navigate("/login");
      return;
    }
    navigate("/checkout", {
      state: {
        directCourse: course || (effectiveCourseId ? { id: effectiveCourseId, price: basePrice } : null),
        appliedCoupon: appliedCoupon?.active ? appliedCoupon : null,
        selectedPlan
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800 font-sans flex flex-col items-center justify-center p-4 py-8 sm:py-12">
      <div className="max-w-4xl w-full space-y-4">
        
        {/* RETURN BUTTON ALIGNED TO LEFT EDGE OF CARD */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 hover:text-gray-900 transition border border-gray-200 shadow-2xs cursor-pointer"
          >
            <FiArrowLeft className="text-sm text-gray-500" />
            <span>Return</span>
          </button>
        </div>

        {/* MAIN CARD CONTAINER */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 space-y-6">
          
          {/* Header Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Upgrade to Codehelp One
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
              Do more with unlimited access to codehelp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: PLAN DETAILS ACCORDION */}
            <div className="md:col-span-6 space-y-4 md:border-r md:border-gray-200 md:pr-6">
              
              {/* Basic Plan Box */}
              <div
                onClick={() => setSelectedPlan("basic")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlan === "basic"
                    ? "bg-sky-50/60 border-[#3BA7F2] shadow-xs"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A]">Basic Plan</h3>
                    <p className="text-xs text-gray-500 mt-0.5">1 month access</p>
                  </div>
                  <span className="text-base font-extrabold text-[#0F172A]">
                    ₹{planPrices.basic.toLocaleString()}.00
                  </span>
                </div>
                {selectedPlan === "basic" && (
                  <div className="mt-4 pt-3 border-t border-gray-200/80 space-y-2.5 text-xs text-gray-600">
                    <p className="text-[#3BA7F2] font-semibold">1 month paid plan.</p>
                    <p className="font-bold text-[#0F172A]">This subscription includes:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><FiLayers className="text-[#3BA7F2]" /> Standard Course Content Access</li>
                      <li className="flex items-center gap-2"><FiBookOpen className="text-[#3BA7F2]" /> Core CS Subjects Notes</li>
                      <li className="flex items-center gap-2"><FiAward className="text-[#3BA7F2]" /> Community Q&A Support</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Plus Plan Box */}
              <div
                onClick={() => setSelectedPlan("plus")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlan === "plus"
                    ? "bg-sky-50/60 border-[#3BA7F2] shadow-xs"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A]">Plus Plan</h3>
                    <p className="text-xs text-gray-500 mt-0.5">1 year access</p>
                  </div>
                  <span className="text-base font-extrabold text-[#0F172A]">
                    ₹{planPrices.plus.toLocaleString()}.00
                  </span>
                </div>
                {selectedPlan === "plus" && (
                  <div className="mt-4 pt-3 border-t border-gray-200/80 space-y-2.5 text-xs text-gray-600">
                    <p className="text-[#3BA7F2] font-semibold">1 year paid plan.</p>
                    <p className="font-bold text-[#0F172A]">This subscription includes:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><FiLayers className="text-[#3BA7F2]" /> All Course Access (DSA + more)</li>
                      <li className="flex items-center gap-2"><FiBookOpen className="text-[#3BA7F2]" /> Core CS Subjects</li>
                      <li className="flex items-center gap-2"><FiAward className="text-[#3BA7F2]" /> Mock Tests</li>
                      <li className="flex items-center gap-2"><FiCheck className="text-[#3BA7F2]" /> Coding Contest</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Pro Plan Box */}
              <div
                onClick={() => setSelectedPlan("pro")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlan === "pro"
                    ? "bg-sky-50/60 border-[#3BA7F2] shadow-xs"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A]">Pro Plan</h3>
                    <p className="text-xs text-gray-500 mt-0.5">2 years access</p>
                  </div>
                  <span className="text-base font-extrabold text-[#0F172A]">
                    ₹{planPrices.pro.toLocaleString()}.00
                  </span>
                </div>
                {selectedPlan === "pro" && (
                  <div className="mt-4 pt-3 border-t border-gray-200/80 space-y-2.5 text-xs text-gray-600">
                    <p className="text-[#3BA7F2] font-semibold">2 years paid plan.</p>
                    <p className="font-bold text-[#0F172A]">This subscription includes:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><FiLayers className="text-[#3BA7F2]" /> Full Access to All Courses & Premium Batches</li>
                      <li className="flex items-center gap-2"><FiBookOpen className="text-[#3BA7F2]" /> Placement Assistance & Resume Review</li>
                      <li className="flex items-center gap-2"><FiAward className="text-[#3BA7F2]" /> Mock Interviews & Coding Contests</li>
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

                {/* Option 1: Basic */}
                <label
                  onClick={() => setSelectedPlan("basic")}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    selectedPlan === "basic"
                      ? "bg-sky-50/60 border-[#3BA7F2]"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="billing_plan"
                      checked={selectedPlan === "basic"}
                      onChange={() => setSelectedPlan("basic")}
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

                {/* Option 2: Plus */}
                <label
                  onClick={() => setSelectedPlan("plus")}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    selectedPlan === "plus"
                      ? "bg-sky-50/60 border-[#3BA7F2]"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="billing_plan"
                      checked={selectedPlan === "plus"}
                      onChange={() => setSelectedPlan("plus")}
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

                {/* Option 3: Pro */}
                <label
                  onClick={() => setSelectedPlan("pro")}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    selectedPlan === "pro"
                      ? "bg-sky-50/60 border-[#3BA7F2]"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="billing_plan"
                      checked={selectedPlan === "pro"}
                      onChange={() => setSelectedPlan("pro")}
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

              {/* Price Breakdown Display */}
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

              {/* Coupon Code Section */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500">Coupon</p>
                
                {appliedCoupon?.active ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
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
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
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
                {couponError && <p className="text-[11px] text-rose-500">{couponError}</p>}
              </div>

              {/* Checkout CTA Button */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleCheckout}
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

    </div>
  );
};

export default UpgradePlanPage;
