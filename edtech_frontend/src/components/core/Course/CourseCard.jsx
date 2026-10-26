import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../../services/slices/cartSlice';
import { FiClock, FiLayers, FiStar, FiArrowRight, FiCheck, FiPlay, FiBookOpen } from 'react-icons/fi';

const CourseCard = ({
  course,
  isEnrolled: propIsEnrolled,
  userEnrollment: propUserEnrollment,
  isLoading: propIsLoading,
  viewMode = "grid"
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);

  if (!course) return null;

  const courseId = String(course._id || course.id);

  // Resolve user enrollment details
  const enrollmentRecord = propUserEnrollment || course.userEnrollment;
  const isSilverExpired = enrollmentRecord?.plan === 'silver' && enrollmentRecord?.expiresAt && new Date(enrollmentRecord.expiresAt) <= new Date();
  const currentPlan = isSilverExpired ? 'expired' : (enrollmentRecord?.plan || (course.studentsEnrolled?.includes(token ? user?._id || user?.id : null) ? 'gold' : null));

  const isEnrolled =
    propIsEnrolled ||
    (currentPlan === 'silver' || currentPlan === 'gold' || currentPlan === 'pro' || currentPlan === 'plus' || currentPlan === 'basic') ||
    (user?.courses?.some((c) => String(c._id || c.id || c) === courseId)) ||
    (user?.enrollments?.some((e) => String(e.courseId || e.course?._id || e.course?.id) === courseId)) ||
    (Array.isArray(course.studentsEnrolled) &&
      course.studentsEnrolled.some((s) => String(s._id || s.id || s) === String(user?._id || user?.id)));

  // Progress calculations
  const progressPct = course.progressPercentage || enrollmentRecord?.progressPercentage || 0;
  const totalLecturesCount = course.courseContent?.reduce((acc, sec) => acc + (sec.subSection?.length || 0), 0) || course.totalLessons || course.totalLectures || 20;
  const completedCount = course.completedVideos?.length || enrollmentRecord?.completedVideos?.length || Math.round((progressPct / 100) * totalLecturesCount);

  // Check if in cart
  const isInCart = cart?.some((item) => String(item._id || item.id) === courseId);

  // Dynamic Prices
  const currentPrice = Number(course?.pricing?.finalPrice ?? course?.price ?? 4100);
  const rawOrigPrice = course?.pricing?.originalPrice || course?.originalPrice;
  const origPrice = rawOrigPrice ? Number(rawOrigPrice) : null;
  const discountPct =
    origPrice && origPrice > currentPrice
      ? Math.round(((origPrice - currentPrice) / origPrice) * 100)
      : Number(course?.pricing?.discountPercentage || course?.discount || 0);

  // Dynamic Metadata
  let durationText = course.totalDuration || course.duration || course.durationHours;
  if (typeof durationText === "number") {
    durationText = `${durationText} Hours`;
  } else if (!durationText) {
    durationText = "8h 30m";
  }

  const sectionsCount =
    course.courseContent?.length ||
    course.sectionsCount ||
    (Array.isArray(course.sections) ? course.sections.length : null) ||
    course.totalSections ||
    2;

  const ratingScore = Number(course.averageRating || course.rating || 0);
  const reviewCount = Number(course.reviewCount || course.ratingAndReviews?.length || 0);

  const handlePreview = (e) => {
    e.stopPropagation();
    navigate(`/courses/${courseId}`);
  };

  const handleStartLearning = (e) => {
    e.stopPropagation();
    navigate(`/s/courses/${courseId}/take`);
  };

  const handleCartAction = (e) => {
    e.stopPropagation();
    if (isEnrolled) {
      navigate(`/s/courses/${courseId}/take`);
      return;
    }
    if (isInCart) {
      navigate("/cart");
      return;
    }
    dispatch(addToCart(course));
  };

  const isUnavailable = course.status === "Draft" || course.isAvailable === false;

  // List View Rendering
  if (viewMode === "list") {
    return (
      <div
        onClick={handlePreview}
        className="bg-white border border-gray-200/80 hover:border-[#3BA7F2]/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-xs hover:shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 relative group cursor-pointer"
      >
        {/* Thumbnail & Info Left */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
          <div className="relative aspect-video w-full sm:w-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            <img
              src={course.thumbnail || course.courseThumbnail || course.image}
              alt={course.courseName || course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isEnrolled && currentPlan && (
                <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  currentPlan === 'pro' || currentPlan === 'gold' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' :
                  currentPlan === 'plus' || currentPlan === 'silver' ? 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]' :
                  currentPlan === 'expired' ? 'bg-red-50 text-red-600 border-red-200' :
                  'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                  {currentPlan === 'pro' || currentPlan === 'gold' ? 'PRO PLAN • ACTIVE' :
                   currentPlan === 'plus' || currentPlan === 'silver' ? 'PLUS PLAN • ACTIVE' :
                   currentPlan === 'basic' ? 'BASIC PLAN • ACTIVE' :
                   currentPlan === 'expired' ? 'PLUS PLAN • EXPIRED' : 'BASIC PLAN'}
                </span>
              )}
              {!isEnrolled && (course.pricing?.isOfferActive || discountPct > 0) && (
                <span className="inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs">
                  ⚡ OFFER: {discountPct > 0 ? `${discountPct}% OFF` : 'LUCKY20'}
                </span>
              )}
            </div>

            <h3 className="font-bold text-sm sm:text-base text-[#0F172A] hover:text-[#3BA7F2] transition-colors truncate max-w-full">
              {course.courseName || course.title}
            </h3>

            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal">
              {course.courseDescription || course.description}
            </p>

            <div className="flex items-center gap-4 text-[11px] text-gray-400 flex-wrap pt-0.5 font-medium">
              <span className="flex items-center gap-1">
                <FiClock /> <span>{durationText}</span>
              </span>
              <span className="flex items-center gap-1">
                <FiBookOpen /> <span>{sectionsCount} Sections</span>
              </span>
              <div className="flex items-center gap-1 text-amber-400">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar
                      key={i}
                      className={`text-[11px] ${
                        i < Math.floor(ratingScore || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-700 ml-0.5">{ratingScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Progress / Price & Actions */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between md:justify-center gap-3 shrink-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
          {isEnrolled ? (
            <div className="w-full sm:w-44 md:text-right space-y-1">
              <div className="flex items-center justify-between md:justify-end gap-2 text-xs font-bold text-[#3BA7F2]">
                <span>{progressPct}% Complete</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#3BA7F2] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 font-medium block">
                {completedCount} / {totalLecturesCount} lessons
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:text-right">
              {origPrice && origPrice > currentPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  ₹{origPrice.toLocaleString()}
                </span>
              )}
              <span className="text-lg sm:text-xl font-black text-[#0F172A]">
                ₹{currentPrice.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition border border-gray-200/80 cursor-pointer"
            >
              Preview
            </button>
            {isEnrolled ? (
              <button
                onClick={handleStartLearning}
                className="px-4 py-2 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer"
              >
                <span>{progressPct > 0 ? "Continue Learning" : "Start Learning"}</span>
                <FiPlay className="text-[10px]" />
              </button>
            ) : propIsLoading ? (
              <button disabled className="px-4 py-2 bg-[#3BA7F2]/50 text-white text-xs font-bold rounded-xl cursor-not-allowed">
                Adding...
              </button>
            ) : isInCart ? (
              <button onClick={handleCartAction} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer">
                <FiCheck className="text-xs" />
                <span>Added to Cart</span>
              </button>
            ) : (
              <button onClick={handleCartAction} className="px-4 py-2 bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer">
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View Rendering (Exact vertical card from screenshot)
  return (
    <div
      onClick={handlePreview}
      className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden hover:border-[#3BA7F2]/50 transition-all duration-300 hover:-translate-y-0.5 shadow-xs hover:shadow-md flex flex-col justify-between cursor-pointer group h-full"
    >
      <div>
        {/* COURSE THUMBNAIL */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 border-b border-gray-100">
          <img
            src={course.thumbnail || course.courseThumbnail || course.image}
            alt={course.courseName || course.title}
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300 ease-out"
          />

          {/* Real-time plan or offer badge */}
          {isEnrolled && currentPlan ? (
            <div className="absolute top-2.5 left-2.5">
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-md border ${
                currentPlan === 'pro' || currentPlan === 'gold' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' :
                currentPlan === 'plus' || currentPlan === 'silver' ? 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]' :
                currentPlan === 'expired' ? 'bg-red-50 text-red-600 border-red-200' :
                'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {currentPlan === 'pro' || currentPlan === 'gold' ? 'PRO PLAN • ACTIVE' :
                 currentPlan === 'plus' || currentPlan === 'silver' ? 'PLUS PLAN • ACTIVE' :
                 currentPlan === 'basic' ? 'BASIC PLAN • ACTIVE' :
                 currentPlan === 'expired' ? 'PLUS PLAN • EXPIRED' : 'ACTIVE'}
              </span>
            </div>
          ) : (course.pricing?.isOfferActive || discountPct > 0) ? (
            <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 border border-white/20 animate-pulse">
              <span>⚡ OFFER: {discountPct > 0 ? `${discountPct}% OFF` : 'LUCKY20'}</span>
            </div>
          ) : null}
        </div>

        {/* CARD BODY CONTENT */}
        <div className="p-3.5 sm:p-4 space-y-2">
          {/* Title */}
          <h3 className="font-bold text-sm sm:text-base text-[#0F172A] line-clamp-2 group-hover:text-[#3BA7F2] transition-colors leading-snug">
            {course.courseName || course.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal">
            {course.courseDescription || course.description}
          </p>

          {/* Metadata Row: Duration & Sections */}
          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium pt-0.5">
            <div className="flex items-center gap-1">
              <FiClock className="text-gray-400 text-xs" />
              <span>{durationText}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiLayers className="text-gray-400 text-xs" />
              <span>{sectionsCount} Sections</span>
            </div>
          </div>

          {/* Rating Row */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar
                  key={i}
                  className={`text-[11px] ${
                    i < Math.floor(ratingScore || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-gray-700 ml-0.5">{ratingScore}</span>
            <span>({reviewCount})</span>
          </div>
        </div>
      </div>

      {/* CARD FOOTER: PRICING / PROGRESS & BUTTONS */}
      <div className="p-3.5 sm:p-4 pt-0 space-y-3">
        {/* Pricing or Progress */}
        {isEnrolled ? (
          <div className="space-y-1.5 border-t border-gray-100 pt-2.5 mt-0.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#3BA7F2]">
              <span>{progressPct}% Complete</span>
              <span className="text-[10px] text-gray-400 font-medium">{completedCount} / {totalLecturesCount} lessons</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#3BA7F2] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 mt-0.5">
            <div className="flex items-center gap-2">
              {origPrice && origPrice > currentPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  ₹{origPrice.toLocaleString()}
                </span>
              )}
              <span className="text-lg sm:text-xl font-black text-[#0F172A]">
                ₹{currentPrice.toLocaleString()}
              </span>
            </div>
            {discountPct > 0 && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {discountPct}% OFF
              </span>
            )}
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition border border-gray-200/80 text-center cursor-pointer"
          >
            Preview
          </button>

          {isEnrolled ? (
            <button
              onClick={handleStartLearning}
              className="flex-1 py-2 bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{progressPct > 0 ? "Continue Learning" : "Start Learning"}</span>
              <FiPlay className="text-[10px]" />
            </button>
          ) : propIsLoading ? (
            <button
              disabled
              className="flex-1 py-2 bg-[#3BA7F2]/50 text-white text-xs font-bold rounded-xl cursor-not-allowed text-center"
            >
              Adding...
            </button>
          ) : isUnavailable ? (
            <button
              disabled
              className="flex-1 py-2 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed text-center border border-gray-200"
            >
              Not Available
            </button>
          ) : isInCart ? (
            <button
              onClick={handleCartAction}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <FiCheck className="text-xs" />
              <span>Added to Cart</span>
            </button>
          ) : (
            <button
              onClick={handleCartAction}
              className="flex-1 py-2 bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

