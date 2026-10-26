import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeFromCart, resetCart, addToCart } from "../../../../services/slices/cartSlice";
import { getAllCourses } from "../../../../services/operations/courseDetailsAPI";
import {
  FiShoppingCart,
  FiArrowRight,
  FiTrash2,
  FiHeart,
  FiStar,
  FiLock,
  FiCheck
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function Cart() {
  const { cart, totalItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [wishlist, setWishlist] = useState({});

  // Default recommended courses matching reference screenshot exactly
  const defaultRecommended = [
    {
      id: "react-native-dev",
      courseName: "Complete React Native Mobile Development",
      courseDescription: "Become an expert in Complete React Native Mobile Development. Learn hands-on projects, industry-best practices, navigation, and cross-platform native features.",
      price: 3649,
      rating: 4.6,
      reviewsCount: 980,
      thumbType: "matrix"
    },
    {
      id: "blockchain-ethereum",
      courseName: "Blockchain & Ethereum Smart Contracts",
      courseDescription: "Become an expert in Blockchain & Ethereum Smart Contract Engineering. Learn hands-on projects, Solidity programming, Web3 integration, and DeFi protocols.",
      price: 3299,
      rating: 4.6,
      reviewsCount: 980,
      thumbType: "laptop"
    },
    {
      id: "data-analytics-sql-powerbi",
      courseName: "Data Analytics with SQL, Tableau and PowerBI",
      courseDescription: "Become an expert in Data Analytics with SQL, Tableau and PowerBI. Learn hands-on projects, industry-best dashboard design, and ETL data pipelines.",
      price: 2949,
      rating: 4.6,
      reviewsCount: 980,
      thumbType: "analytics"
    }
  ];

  // Fetch recommended courses dynamically from database or fallback to screenshot courses
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      try {
        const allCourses = await getAllCourses();
        if (allCourses && Array.isArray(allCourses) && allCourses.length > 0) {
          const cartIds = new Set(cart.map((c) => c._id || c.id));
          const filtered = allCourses.filter((c) => !cartIds.has(c._id || c.id));
          if (filtered.length >= 3) {
            setRecommendedCourses(filtered.slice(0, 3));
          } else {
            setRecommendedCourses(defaultRecommended);
          }
        } else {
          setRecommendedCourses(defaultRecommended);
        }
      } catch (err) {
        setRecommendedCourses(defaultRecommended);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [cart]);

  // Dynamic Price Calculations
  const subtotal = cart.reduce((acc, course) => {
    const origPrice = Number(course?.pricing?.originalPrice || course?.originalPrice || course?.price || 0);
    return acc + origPrice;
  }, 0);

  const finalTotal = cart.reduce((acc, course) => {
    const price = Number(course?.pricing?.finalPrice || course?.price || 0);
    return acc + price;
  }, 0);

  const totalDiscount = subtotal > finalTotal ? subtotal - finalTotal : 0;
  const discountPercentage = subtotal > 0 ? Math.round((totalDiscount / subtotal) * 100) : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const firstCourse = cart[0];
    const courseId = firstCourse?._id || firstCourse?.id;
    if (courseId) {
      navigate(`/courses/${courseId}`);
    } else {
      navigate("/dashboard/buy-courses");
    }
  };

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.success(wishlist[id] ? "Removed from wishlist" : "Added to wishlist!");
  };

  // Render course thumbnail graphics matching screenshot
  const renderCourseThumbnail = (thumbType) => {
    switch (thumbType) {
      case "matrix":
        return (
          <div className="w-full h-44 bg-[#0A140F] relative flex items-center justify-center overflow-hidden">
            {/* Matrix green binary code rain */}
            <svg className="w-full h-full absolute inset-0 opacity-70" viewBox="0 0 300 160">
              <defs>
                <linearGradient id="matrixGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#052E16" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <g fill="#22C55E" fontSize="9" fontFamily="monospace" opacity="0.85">
                <text x="15" y="20">1 0 1 0 1</text>
                <text x="15" y="40">0 1 0 1 0</text>
                <text x="15" y="60">1 1 0 0 1</text>
                <text x="15" y="80">0 0 1 1 0</text>
                <text x="15" y="100">1 0 1 0 1</text>

                <text x="75" y="30">0 1 1 0 1</text>
                <text x="75" y="50">1 0 0 1 0</text>
                <text x="75" y="70">0 1 1 0 1</text>
                <text x="75" y="90">1 1 0 1 0</text>
                <text x="75" y="110">0 0 1 0 1</text>

                <text x="140" y="20">1 1 0 0 1</text>
                <text x="140" y="40">0 1 1 1 0</text>
                <text x="140" y="60">1 0 0 1 1</text>
                <text x="140" y="80">0 1 0 0 1</text>
                <text x="140" y="100">1 1 1 0 0</text>

                <text x="200" y="35">0 1 0 1 0</text>
                <text x="200" y="55">1 0 1 0 1</text>
                <text x="200" y="75">0 0 1 1 0</text>
                <text x="200" y="95">1 1 0 0 1</text>
                <text x="200" y="115">0 1 0 1 1</text>

                <text x="260" y="25">1 0 1 1 0</text>
                <text x="260" y="45">0 1 0 0 1</text>
                <text x="260" y="65">1 1 1 0 1</text>
                <text x="260" y="85">0 0 1 1 0</text>
                <text x="260" y="105">1 0 0 1 1</text>
              </g>
            </svg>
          </div>
        );

      case "laptop":
        return (
          <div className="w-full h-44 bg-[#E2E8F0] relative flex items-center justify-center overflow-hidden">
            {/* Coding workspace with yellow mug and succulent plant */}
            <svg className="w-full h-full" viewBox="0 0 300 160">
              {/* Desk surface */}
              <rect y="125" width="300" height="35" fill="#CBD5E1" />
              
              {/* Laptop base and screen */}
              <rect x="50" y="30" width="140" height="90" rx="6" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              <rect x="56" y="36" width="128" height="78" rx="3" fill="#0F172A" />
              {/* Code lines on screen */}
              <line x1="64" y1="48" x2="100" y2="48" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="72" y1="56" x2="140" y2="56" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="72" y1="64" x2="120" y2="64" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="64" y1="72" x2="90" y2="72" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="72" y1="80" x2="150" y2="80" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="72" y1="88" x2="110" y2="88" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M35 120 L205 120 L195 125 L45 125 Z" fill="#94A3B8" />

              {/* Yellow coffee mug */}
              <rect x="202" y="90" width="22" height="30" rx="4" fill="#FACC15" />
              <path d="M224 96 C229 96 232 100 232 105 C232 110 229 114 224 114" stroke="#FACC15" strokeWidth="3" fill="none" />

              {/* Plant pot */}
              <rect x="238" y="70" width="26" height="50" rx="4" fill="#E2E8F0" stroke="#94A3B8" />
              <path d="M251 70 C251 45 265 40 265 40 C265 40 260 60 251 70 Z" fill="#10B981" />
              <path d="M251 70 C251 50 236 42 236 42 C236 42 240 60 251 70 Z" fill="#059669" />
            </svg>
          </div>
        );

      case "analytics":
        return (
          <div className="w-full h-44 bg-[#F1F5F9] relative flex items-center justify-center overflow-hidden">
            {/* Analytics laptop screen with charts */}
            <svg className="w-full h-full" viewBox="0 0 300 160">
              <rect y="125" width="300" height="35" fill="#E2E8F0" />
              
              {/* Laptop */}
              <rect x="75" y="32" width="150" height="92" rx="6" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              <rect x="81" y="38" width="138" height="80" rx="3" fill="#0B1120" />
              
              {/* Analytics Dashboard Grid */}
              <rect x="88" y="44" width="60" height="32" rx="2" fill="#1E293B" />
              {/* Bar charts */}
              <rect x="94" y="62" width="6" height="10" rx="1" fill="#38BDF8" />
              <rect x="104" y="54" width="6" height="18" rx="1" fill="#3BA7F2" />
              <rect x="114" y="50" width="6" height="22" rx="1" fill="#10B981" />
              <rect x="124" y="58" width="6" height="14" rx="1" fill="#F59E0B" />
              <rect x="134" y="48" width="6" height="24" rx="1" fill="#EC4899" />

              {/* Line graph */}
              <rect x="154" y="44" width="58" height="32" rx="2" fill="#1E293B" />
              <path d="M158 70 L168 62 L178 66 L188 52 L202 56" stroke="#38BDF8" strokeWidth="2" fill="none" />

              {/* Bottom data table preview */}
              <rect x="88" y="82" width="124" height="30" rx="2" fill="#1E293B" />
              <line x1="94" y1="92" x2="204" y2="92" stroke="#475569" strokeWidth="1.5" />
              <line x1="94" y1="102" x2="204" y2="102" stroke="#475569" strokeWidth="1.5" />

              {/* Laptop base */}
              <path d="M60 124 L240 124 L228 128 L72 128 Z" fill="#94A3B8" />
            </svg>
          </div>
        );

      default:
        return (
          <div className="w-full h-44 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl">
            <FiShoppingCart />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 text-[#1E293B] font-sans pb-12 max-w-[1240px] mx-auto">
      
      {/* 1. CART HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="text-blue-600">
            <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
            Your Cart
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-normal pl-9 sm:pl-10">
          Review your selected courses before checkout.
        </p>
      </div>

      {/* 2. CART BANNER: EMPTY STATE OR FILLED CART */}
      {cart.length === 0 ? (
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#3BA7F2] rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Column: Icon + Text + Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10 max-w-xl">
            {/* White/Blue Cart Icon Circle */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-500/25 border border-blue-400/30 flex items-center justify-center text-white text-2xl shrink-0 shadow-inner">
              <FiShoppingCart className="text-2xl sm:text-3xl text-white" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Your cart is empty
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed">
                Looks like you haven't added any courses to your cart yet. Explore our top courses and start learning today.
              </p>

              {/* Action Button */}
              <button
                onClick={() => navigate("/dashboard/buy-courses")}
                className="px-5 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-1.5 mt-3 cursor-pointer active:scale-95"
              >
                <span>Explore Courses</span>
                <FiArrowRight className="text-sm" />
              </button>
            </div>
          </div>

          {/* Right Column: 3D Shopping Cart with Graduation Cap & Plant Illustration */}
          <div className="hidden lg:flex items-center justify-center relative z-10 select-none shrink-0 pr-4">
            <svg width="240" height="130" viewBox="0 0 240 130" fill="none">
              <defs>
                <linearGradient id="capGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <filter id="cartGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#38BDF8" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Stacked blue books on left */}
              <g transform="translate(10, 80)">
                <rect x="0" y="24" width="46" height="12" rx="2" fill="#3BA7F2" opacity="0.9" />
                <rect x="2" y="12" width="44" height="12" rx="2" fill="#60A5FA" opacity="0.95" />
                <rect x="4" y="0" width="42" height="12" rx="2" fill="#93C5FD" />
              </g>

              {/* White Shopping Cart with blue wheels */}
              <g filter="url(#cartGlow)" transform="translate(50, 15)">
                {/* Cart basket mesh */}
                <path
                  d="M20 20 H95 L84 75 H32 L20 20 Z"
                  stroke="white"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line x1="40" y1="20" x2="46" y2="75" stroke="white" strokeWidth="2.5" />
                <line x1="60" y1="20" x2="62" y2="75" stroke="white" strokeWidth="2.5" />
                <line x1="80" y1="20" x2="76" y2="75" stroke="white" strokeWidth="2.5" />
                <line x1="25" y1="38" x2="90" y2="38" stroke="white" strokeWidth="2.5" />
                <line x1="28" y1="56" x2="86" y2="56" stroke="white" strokeWidth="2.5" />
                
                {/* Cart handle */}
                <path d="M10 5 H22" stroke="white" strokeWidth="4" strokeLinecap="round" />
                <path d="M22 5 L20 20" stroke="white" strokeWidth="3" />

                {/* Cart chassis */}
                <path d="M30 75 L28 88 H85" stroke="white" strokeWidth="3.5" strokeLinecap="round" />

                {/* Left Wheel */}
                <circle cx="38" cy="94" r="6" fill="#38BDF8" stroke="white" strokeWidth="2.5" />
                <circle cx="38" cy="94" r="2" fill="white" />

                {/* Right Wheel */}
                <circle cx="78" cy="94" r="6" fill="#38BDF8" stroke="white" strokeWidth="2.5" />
                <circle cx="78" cy="94" r="2" fill="white" />

                {/* Floating Graduation Cap above the cart */}
                <g transform="translate(42, -12)">
                  {/* Cap diamond */}
                  <polygon points="25,0 50,10 25,20 0,10" fill="url(#capGrad)" stroke="#60A5FA" strokeWidth="1.5" />
                  {/* Cap skull cap under */}
                  <path d="M10 14V22C10 28 40 28 40 22V14" fill="#1E40AF" />
                  {/* Tassel cord and brush */}
                  <path d="M25 10 C32 12 36 20 36 26" stroke="#FACC15" strokeWidth="1.75" fill="none" strokeLinecap="round" />
                  <circle cx="36" cy="27" r="1.5" fill="#FACC15" />
                  <circle cx="25" cy="10" r="1.5" fill="#FACC15" />
                </g>
              </g>

              {/* Succulent green plant in pot on right */}
              <g transform="translate(178, 55)">
                {/* White pot */}
                <path d="M12 40 L16 68 H36 L40 40 Z" fill="white" stroke="#CBD5E1" strokeWidth="1.5" />
                
                {/* Succulent leaves */}
                <path d="M26 40 C26 20 12 15 12 15 C12 15 16 30 26 40 Z" fill="#22C55E" />
                <path d="M26 40 C26 18 40 12 40 12 C40 12 36 28 26 40 Z" fill="#16A34A" />
                <path d="M26 40 C26 24 26 8 26 8 C26 8 22 26 26 40 Z" fill="#4ADE80" />
              </g>
            </svg>
          </div>

        </div>
      ) : (
        /* FILLED CART STATE (Clean light mode view) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT: Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-700">
                {totalItems} Course{totalItems > 1 ? "s" : ""} in Cart
              </span>
              <button
                onClick={() => dispatch(resetCart())}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <FiTrash2 size={13} /> Clear Cart
              </button>
            </div>

            {cart.map((course) => {
              const courseId = course._id || course.id;
              const origPrice = Number(course?.pricing?.originalPrice || course?.originalPrice || course?.price || 0);
              const currentPrice = Number(course?.pricing?.finalPrice || course?.price || 0);

              return (
                <div
                  key={courseId}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row items-start justify-between gap-4 shadow-xs"
                >
                  <div className="relative aspect-video w-full sm:w-44 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"}
                      alt={course.courseName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                      {course.courseName}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.courseDescription}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-600 pt-1">
                      <span className="text-amber-500">★</span>
                      <span className="font-bold text-slate-900">{course.averageRating ?? course.rating ?? 0}</span>
                      <span className="text-slate-400">({course.reviewsCount ?? course.reviewCount ?? course.ratingAndReviews?.length ?? 0})</span>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 shrink-0">
                    <button
                      onClick={() => dispatch(removeFromCart(courseId))}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Remove Course"
                    >
                      <FiTrash2 size={16} />
                    </button>
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-bold text-slate-900">
                        ₹{currentPrice.toLocaleString()}
                      </div>
                      {origPrice > currentPrice && (
                        <div className="text-xs text-slate-400 line-through">
                          ₹{origPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Order Summary */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 space-y-5 shadow-xs sticky top-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="text-slate-900 font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>- ₹{totalDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Total</span>
                  <span className="text-[10px] text-slate-400">Inclusive of all taxes</span>
                </div>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  ₹{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <FiLock className="text-sm" />
              <span>Proceed to Checkout</span>
            </button>
          </div>

        </div>
      )}

      {/* 3. "YOU MIGHT ALSO LIKE" SECTION */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          You might also like
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(recommendedCourses.length > 0 ? recommendedCourses : defaultRecommended).map((course) => {
            const courseId = course._id || course.id;
            const price = Number(course?.pricing?.finalPrice || course?.price || 3299);
            const rating = course.averageRating ?? course.rating ?? 0;
            const reviews = course.reviewsCount ?? course.reviewCount ?? course.ratingAndReviews?.length ?? 0;
            const isWishlisted = Boolean(wishlist[courseId]);

            return (
              <div
                key={courseId}
                className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail area with heart button */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.courseName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      renderCourseThumbnail(course.thumbType || "matrix")
                    )}

                    {/* Wishlist Heart Button */}
                    <button
                      onClick={(e) => toggleWishlist(courseId, e)}
                      className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-xs transition-colors cursor-pointer ${
                        isWishlisted
                          ? "bg-rose-500 text-white shadow-xs"
                          : "bg-black/45 text-white hover:text-rose-400"
                      }`}
                      title="Wishlist"
                    >
                      <FiHeart className={isWishlisted ? "fill-white" : ""} size={14} />
                    </button>
                  </div>

                  {/* Body: Title & Description */}
                  <div className="p-5 space-y-1.5">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1 group-hover:text-[#3BA7F2] transition-colors">
                      {course.courseName}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.courseDescription}
                    </p>
                  </div>
                </div>

                {/* Footer: Rating, Price, View Button */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500">★</span>
                    <span className="font-bold text-slate-900">{rating}</span>
                    <span className="text-slate-400 text-[11px]">({reviews})</span>
                  </div>

                  {/* Price & View Button */}
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                      ₹{price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => navigate(`/courses/${courseId}`)}
                      className="px-4 py-1.5 rounded-xl border border-blue-500 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all cursor-pointer active:scale-95"
                    >
                      View
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
