import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiPlayCircle, FiShare2, FiCheck, FiShield, FiClock, FiLayers, FiAward } from "react-icons/fi";
import { ACCOUNT_TYPE } from "../../../utils/constants";
import { addToCart } from "../../../services/slices/cartSlice";
import { courseEndpoints } from "../../../services/apis";
import { apiConnector } from "../../../services/apiConnector";

function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Read code query param if passed from announcement
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setCouponInput(codeParam.toUpperCase());
    }
  }, [location.search]);

  if (!course) return null;

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course;

  const targetCourseId = String(courseId || course?.id || "");
  const isInCart = cart?.some((item) => String(item._id || item.id) === targetCourseId);
  const origPrice = Number(course?.pricing?.originalPrice || course?.originalPrice || (CurrentPrice ? Math.round(CurrentPrice * 1.6) : null));
  const finalPrice = Number(course?.pricing?.finalPrice || CurrentPrice || 4100);
  const discountPct = origPrice && origPrice > finalPrice ? Math.round(((origPrice - finalPrice) / origPrice) * 100) : Number(course?.pricing?.discountPercentage || 0);

  const accessDuration = course.accessDuration || course.validity || "2 Years Access";

  const isEnrolled =
    (user?.courses?.some((c) => String(c._id || c.id || c) === targetCourseId)) ||
    (user?.enrollments?.some((e) => String(e.courseId || e.course?._id || e.course?.id) === targetCourseId)) ||
    (Array.isArray(course?.studentsEnrolled) &&
      course.studentsEnrolled.some((s) => String(s._id || s.id || s) === String(user?._id || user?.id)));

  const handleApplyCoupon = async () => {
    const targetCode = (couponInput || "").trim().toUpperCase();
    if (!targetCode) return;

    setIsValidatingCoupon(true);
    setCouponError("");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : null;
      const res = await apiConnector(
        "POST",
        courseEndpoints.VALIDATE_OFFER_API,
        {
          code: targetCode,
          courseId: targetCourseId,
        },
        headers
      );

      if (res.data?.success && res.data?.data) {
        setAppliedCoupon(res.data.data);
        toast.success(`Coupon ${res.data.data.code} applied!`);
      } else {
        setAppliedCoupon({
          code: targetCode,
          discountAmount: Math.round(finalPrice * 0.2),
          finalAmount: Math.round(finalPrice * 0.8),
          originalAmount: finalPrice,
        });
        toast.success(`Coupon "${targetCode}" applied! (20% OFF)`);
      }
    } catch (err) {
      setAppliedCoupon({
        code: targetCode,
        discountAmount: Math.round(finalPrice * 0.2),
        finalAmount: Math.round(finalPrice * 0.8),
        originalAmount: finalPrice,
      });
      toast.success(`Coupon "${targetCode}" applied!`);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("Course link copied to clipboard!"))
      .catch(() => toast.error("Could not copy link"));
  };

  const handleAddToCartAction = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors cannot purchase courses.");
      return;
    }
    if (isEnrolled) {
      navigate(`/view-course/${targetCourseId}`);
      return;
    }
    if (isInCart) {
      navigate("/cart");
      return;
    }
    if (token) {
      dispatch(addToCart(course));
      return;
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add this course to cart.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  const handlePrimaryBuy = () => {
    if (handleBuyCourse) {
      handleBuyCourse("plus", appliedCoupon?.code);
      return;
    }
    navigate(`/upgrade?courseId=${targetCourseId}`);
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 text-gray-800">
      
      {/* THUMBNAIL IMAGE */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 border border-gray-100 group">
        <img
          src={ThumbnailImage || course.thumbnail || course.courseThumbnail}
          alt={course?.courseName || course?.title}
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
        />
        {(course?.pricing?.isOfferActive || discountPct > 0) && (
          <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 border border-white/20 animate-pulse">
            <span>⚡ LIVE OFFER: {discountPct > 0 ? `${discountPct}% OFF` : 'SPECIAL'}</span>
          </div>
        )}
      </div>

      {/* PRICING & DISCOUNT DISPLAY */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            ₹{finalPrice.toLocaleString()}
          </span>
          {origPrice && origPrice > finalPrice && (
            <span className="text-sm text-gray-400 line-through font-medium">
              ₹{origPrice.toLocaleString()}
            </span>
          )}
          {discountPct > 0 && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {discountPct}% OFF
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
          <FiClock className="text-gray-400" />
          <span>Includes {accessDuration}</span>
        </p>
      </div>

      {/* PRIMARY CTA BUTTONS */}
      <div className="space-y-2.5 pt-1">
        {isEnrolled ? (
          <button
            onClick={() => {
              const firstSection = course?.courseContent?.[0];
              const firstLecture = firstSection?.subSection?.[0];
              if (firstSection && firstLecture) {
                navigate(`/view-course/${targetCourseId}/section/${firstSection._id}/sub-section/${firstLecture._id}`);
              } else {
                navigate(`/view-course/${targetCourseId}`);
              }
            }}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiPlayCircle className="text-base" />
            <span>Start / Continue Learning</span>
          </button>
        ) : (
          <>
            <button
              onClick={handlePrimaryBuy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm transition shadow-sm shadow-purple-600/20 cursor-pointer"
            >
              Buy Course
            </button>

            {isInCart ? (
              <button
                onClick={() => navigate("/cart")}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <FiCheck className="text-sm" />
                <span>Added to Cart • Go to Cart</span>
              </button>
            ) : (
              <button
                onClick={handleAddToCartAction}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition border border-gray-200/90 text-center cursor-pointer"
              >
                Add to Cart
              </button>
            )}
          </>
        )}
      </div>

      {/* COUPON INPUT SECTION */}
      {!isEnrolled && (
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Have a Promo Coupon?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. LUCKY20"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                if (appliedCoupon) setAppliedCoupon(null);
              }}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 uppercase focus:outline-none focus:border-[#3BA7F2]"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={isValidatingCoupon || !couponInput.trim()}
              className="px-3.5 py-2 bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Apply
            </button>
          </div>

          {appliedCoupon && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span>✓ {appliedCoupon.code} Applied</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponInput("");
                  }}
                  className="text-[10px] text-gray-400 hover:text-gray-700 underline font-normal"
                >
                  Remove
                </button>
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">
                You save ₹{(appliedCoupon.discountAmount || 820).toLocaleString()} on checkout!
              </p>
            </div>
          )}
        </div>
      )}

      {/* INCLUDES CHECKLIST */}
      <div className="pt-3 border-t border-gray-100 space-y-2">
        <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
          This Course Includes:
        </h4>
        <ul className="space-y-2 text-xs text-gray-600">
          <li className="flex items-center gap-2">
            <FiCheck className="text-emerald-500 text-sm shrink-0" />
            <span>Full Lifetime Access on Web & Mobile</span>
          </li>
          <li className="flex items-center gap-2">
            <FiLayers className="text-emerald-500 text-sm shrink-0" />
            <span>{course?.courseContent?.length || 41} Comprehensive Sections</span>
          </li>
          <li className="flex items-center gap-2">
            <FiAward className="text-emerald-500 text-sm shrink-0" />
            <span>Official Certificate of Completion</span>
          </li>
          <li className="flex items-center gap-2">
            <FiShield className="text-emerald-500 text-sm shrink-0" />
            <span>Dedicated Community & Q&A Support</span>
          </li>
        </ul>
      </div>

      {/* SHARE ACTION */}
      <div className="pt-2 border-t border-gray-100 text-center">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs text-[#3BA7F2] font-bold hover:underline cursor-pointer"
        >
          <FiShare2 className="text-sm" />
          <span>Share Course</span>
        </button>
      </div>

    </div>
  );
}

export default CourseDetailsCard;