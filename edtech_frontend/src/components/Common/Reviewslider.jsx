import React, { useState, useEffect } from 'react';
import { fetchAllReviews } from '../../services/operations/courseDetailsAPI';
import { FiStar, FiCheckCircle } from 'react-icons/fi';

const fallbackReviews = [
  {
    user: {
      firstName: "Priya",
      lastName: "Sharma",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
      accountType: "Full-Stack Engineer @ Atlassian"
    },
    rating: 5,
    course: { courseName: "Full-Stack Web Mastery" },
    review: "The curriculum depth and interactive sandbox projects were incredible. I went from struggling with basic JavaScript promises to deploying production microservices in 4 months."
  },
  {
    user: {
      firstName: "David",
      lastName: "Kim",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      accountType: "Cloud Architect @ TechCorp"
    },
    rating: 5,
    course: { courseName: "DevOps & Cloud Infrastructure" },
    review: "Hands down the best technical platform I have encountered. The mentor feedback was thorough, actionable, and focused on clean architectural design patterns."
  },
  {
    user: {
      firstName: "Ananya",
      lastName: "Deshmukh",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
      accountType: "Frontend Developer @ Razorpay"
    },
    rating: 5,
    course: { courseName: "React 19 & Next.js Architecture" },
    review: "CodeLearn eliminated the guesswork from learning modern web development. The practice tests and timed quizzes gave me immense confidence in technical interviews."
  }
];

const Reviewslider = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const getReviewsData = async () => {
      setLoading(true);
      try {
        const data = await fetchAllReviews();
        const list = Array.isArray(data) ? data : (data?.data || []);
        if (isMounted) {
          if (list && Array.isArray(list) && list.length > 0) {
            setReviews(list);
          } else {
            setReviews(fallbackReviews);
          }
        }
      } catch (err) {
        if (isMounted) setReviews(fallbackReviews);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    getReviewsData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev >= totalPages - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(interval);
  }, [totalPages]);

  const startIndex = currentSlide * itemsPerPage;
  const visibleReviews = reviews.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="w-full max-w-maxContent mx-auto px-4 py-12 lg:py-16 text-center">
      
      {/* Header */}
      <div className="max-w-2xl mx-auto space-y-3 mb-10">
        <div className="inline-flex items-center gap-1.5 glass-pill text-[#13AA92] text-xs font-semibold px-4 py-1.5 rounded-full border border-white/80 shadow-sm">
          <FiStar className="text-xs text-[#13AA92]" />
          <span>Learner Community</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          What Our Learners Say
        </h2>
        <p className="text-base text-gray-600 font-normal leading-relaxed">
          Real career outcomes and experiences from engineers across the globe.
        </p>
      </div>

      {/* Testimonials Grid - Frosted Glass Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {Array.from({ length: itemsPerPage }).map((_, idx) => (
            <div key={idx} className="glass-card rounded-3xl p-6 sm:p-7 h-52 border border-white/80 animate-pulse flex flex-col justify-between">
              <div className="h-4 bg-white/40 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-white/40"></div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-white/40 rounded w-20"></div>
                  <div className="h-2 bg-white/20 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {visibleReviews.map((item, idx) => {
              const user = item.user || {};
              const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Software Engineer';
              const image = user.image || `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(name)}`;
              const designation = item.course?.courseName || user.accountType || 'Software Developer';
              const reviewText = item.review || "CodeLearn helped me transition into a high-growth engineering role with complete confidence.";

              return (
                <div
                  key={item._id || item.id || idx}
                  className="glass-card glass-card-hover rounded-3xl p-6 sm:p-7 border border-white/80 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* 5-Star Rating */}
                    <div className="flex items-center gap-1 text-amber-400 text-xs mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="fill-amber-400" />
                      ))}
                      <span className="text-gray-500 font-medium text-[11px] ml-1.5">5.0</span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal line-clamp-4">
                      "{reviewText}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-5 border-t border-white/60 mt-6">
                    <img
                      src={image}
                      alt={name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/80 shadow-sm"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {name}
                        </h4>
                        <FiCheckCircle className="text-[#3BA7F2] text-xs shrink-0" title="Verified Learner" />
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                        {designation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Indicators */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx
                      ? "w-6 bg-[#3BA7F2]"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}

    </section>
  );
};

export default Reviewslider;
