import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnector";
import { courseEndpoints } from "../services/apis";
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar";
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard";
import ConfirmationModal from "../components/Common/ConfirmationModal";
import {
  FiClock,
  FiLayers,
  FiGlobe,
  FiAward,
  FiCheckCircle,
  FiSearch,
  FiStar,
  FiChevronDown,
  FiChevronUp,
  FiHelpCircle
} from "react-icons/fi";
import { FaUserGraduate } from "react-icons/fa";
import toast from "react-hot-toast";

const { COURSE_DETAILS_API } = courseEndpoints;

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState([]);
  const [confirmationModal, setConfirmationModal] = useState(null);

  // Content search & pagination
  const [contentSearch, setContentSearch] = useState("");
  const [showAllModules, setShowAllModules] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : null;
        const response = await apiConnector(
          "GET",
          `${COURSE_DETAILS_API}?courseId=${courseId}`,
          null,
          headers
        );
        if (response?.data?.success) {
          setCourse(response.data.data);
          // Expand first section by default
          if (response.data.data?.courseContent?.length > 0) {
            setIsActive([response.data.data.courseContent[0]._id]);
          }
        } else {
          toast.error("Could not fetch course details");
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        toast.error("Error loading course details");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchCourse();
  }, [courseId, token]);

  const handleActive = (id) => {
    setIsActive((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleBuyCourse = (plan = "plus", couponCode = null) => {
    if (!token) {
      setConfirmationModal({
        text1: "You are not logged in!",
        text2: "Please login to purchase or access this course.",
        btn1Text: "Login",
        btn2Text: "Cancel",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => setConfirmationModal(null),
      });
      return;
    }
    navigate(`/upgrade?courseId=${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-[#3BA7F2] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-500">Loading course preview...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">
          <FiHelpCircle />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A]">Course Not Found</h2>
        <p className="text-xs text-gray-500 max-w-sm">
          The course you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/dashboard/courses")}
          className="px-5 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs font-bold transition shadow-xs"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  // Derived Dynamic Metadata (Strictly from course object, no hardcoded fake fallbacks)
  const totalLecturesCount =
    course.courseContent?.reduce((acc, sec) => acc + (sec.subSection?.length || 0), 0) ||
    course.totalLessons ||
    0;

  const totalSectionsCount = course.courseContent?.length || course.totalSections || 0;
  
  // Calculate average rating dynamically from ratingAndReviews if available
  let ratingScore = Number(course.averageRating || course.rating || 0);
  if (!ratingScore && Array.isArray(course.ratingAndReviews) && course.ratingAndReviews.length > 0) {
    const totalRating = course.ratingAndReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    ratingScore = Number((totalRating / course.ratingAndReviews.length).toFixed(1));
  }
  const reviewCount = Number(course.reviewCount || course.ratingAndReviews?.length || 0);

  // Exact student enrollment count from database array
  const studentCount = Array.isArray(course.studentsEnrolled) ? course.studentsEnrolled.length : Number(course.studentsCount || 0);

  // Dynamic duration calculation
  let calculatedDuration = course.totalDuration || course.duration;
  if (!calculatedDuration && Array.isArray(course.courseContent)) {
    let totalMins = 0;
    course.courseContent.forEach((sec) => {
      sec.subSection?.forEach((sub) => {
        if (sub.timeDuration) {
          const str = String(sub.timeDuration).toLowerCase();
          const matchM = str.match(/(\d+)\s*m/);
          const matchS = str.match(/(\d+)\s*s/);
          if (matchM) totalMins += parseInt(matchM[1]);
          if (matchS) totalMins += Math.round(parseInt(matchS[1]) / 60);
          if (!matchM && !matchS && !isNaN(parseFloat(str))) totalMins += parseFloat(str);
        }
      });
    });
    if (totalMins > 0) {
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      calculatedDuration = h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
  }
  const durationText = calculatedDuration || "Self-Paced";

  const languageText = course.language || "English";
  const levelText = typeof course.level === "string" ? course.level : "All Levels";

  // Check enrollment status dynamically
  const isEnrolled =
    (Array.isArray(course?.studentsEnrolled) &&
      user?._id &&
      course.studentsEnrolled.some(
        (id) => String(id) === String(user._id) || String(id?._id) === String(user._id)
      )) ||
    (Array.isArray(user?.courses) &&
      user.courses.some(
        (c) => String(c) === String(courseId) || String(c?._id) === String(courseId)
      ));

  const handlePromptBuy = (lectureTitle) => {
    setConfirmationModal({
      text1: "Unlock Full Course Access",
      text2: lectureTitle
        ? `"${lectureTitle}" is locked. Please buy or upgrade your plan to access all video lectures.`
        : "Please buy or upgrade your course plan to access all video lectures.",
      btn1Text: "Buy / Upgrade Course",
      btn2Text: "Cancel",
      btn1Handler: () => {
        setConfirmationModal(null);
        handleBuyCourse();
      },
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  // Filter sections based on live content search query
  const filteredSections = (course.courseContent || []).filter((section) => {
    if (!contentSearch.trim()) return true;
    const q = contentSearch.toLowerCase();
    const secMatch = section.sectionName?.toLowerCase().includes(q);
    const subMatch = section.subSection?.some((sub) => sub.title?.toLowerCase().includes(q));
    return secMatch || subMatch;
  });

  const displayedSections = showAllModules ? filteredSections : filteredSections.slice(0, 4);

  // Dynamic Instructor details from API
  const instructorInfo = course.instructor
    ? {
        name: `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim() || "Course Instructor",
        designation: course.instructor.designation || course.instructor.about || "Senior Technical Instructor",
        image: course.instructor.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(course.instructor.firstName || "Instructor")}`,
        bio: course.instructor.bio || "Passionate about empowering students through high-quality technical education.",
      }
    : {
        name: "Course Instructor",
        designation: "Lead Technical Instructor",
        image: `https://api.dicebear.com/7.x/initials/svg?seed=Instructor`,
        bio: "Passionate about empowering students through high-quality technical education.",
      };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-800 pb-16">
      
      {/* MAIN CONTAINER (2-COLUMN FLEX LAYOUT PREVENTS ANY CARD OVERLAP) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT MAIN CONTENT COLUMN */}
          <div className="flex-1 min-w-0 space-y-8">
            
            {/* 1. HERO TITLE & COURSE SUMMARY CARD */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
              
              {/* Status & Category Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    course.status === "Published"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      course.status === "Published" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {course.status || "Published"}
                </span>

                {course.category?.name && (
                  <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                    {course.category.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
                {course.courseName || course.title}
              </h1>

              {/* Dynamic Badges Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 font-medium pt-0.5">
                {/* Rating */}
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 text-amber-900">
                  <FiStar className="text-amber-500 fill-amber-500 text-xs" />
                  <span className="font-extrabold">{ratingScore}</span>
                  <span className="text-amber-700 font-normal">({reviewCount} Ratings)</span>
                </div>

                {/* Students */}
                <div className="flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 text-[#3BA7F2]">
                  <FaUserGraduate className="text-xs" />
                  <span className="font-bold">{studentCount.toLocaleString()}+ Students</span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1 bg-gray-100/90 px-2.5 py-1 rounded-lg border border-gray-200/80">
                  <FiClock className="text-gray-400 text-xs" />
                  <span>{durationText}</span>
                </div>

                {/* Sections */}
                <div className="flex items-center gap-1 bg-gray-100/90 px-2.5 py-1 rounded-lg border border-gray-200/80">
                  <FiLayers className="text-gray-400 text-xs" />
                  <span>{totalSectionsCount} Sections</span>
                </div>

                {/* Language */}
                <div className="flex items-center gap-1 bg-gray-100/90 px-2.5 py-1 rounded-lg border border-gray-200/80">
                  <FiGlobe className="text-gray-400 text-xs" />
                  <span>{languageText}</span>
                </div>

                {/* Level */}
                <div className="flex items-center gap-1 bg-gray-100/90 px-2.5 py-1 rounded-lg border border-gray-200/80">
                  <FiAward className="text-gray-400 text-xs" />
                  <span>{levelText}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal pt-1">
                {course.courseDescription || course.description}
              </p>
            </div>

            {/* 2. WHAT YOU'LL LEARN */}
            {(course.whatYouWillLearn || course.benefits) && (
              <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                <h2 className="text-lg font-bold text-[#0F172A]">What you'll learn</h2>
                <p className="text-xs text-gray-500 font-normal">
                  Discover the key skills and concepts you will master in this course to advance your programming expertise.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(typeof course.whatYouWillLearn === "string"
                    ? course.whatYouWillLearn.split(".").filter((s) => s.trim())
                    : Array.isArray(course.whatYouWillLearn)
                    ? course.whatYouWillLearn
                    : [course.whatYouWillLearn || "Master Data Structures & Algorithms", "Learn real-world coding techniques", "Solve interview questions"]
                  ).map((point, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                      <FiCheckCircle className="text-emerald-500 text-sm shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700 font-medium leading-relaxed">{point.trim ? point.trim() : point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. COURSE CONTENT (ACCORDION & SEARCH) */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">Course Content</h2>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">
                    {totalSectionsCount} Sections • {totalLecturesCount} Lectures • {durationText}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Live Search Input */}
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search sections..."
                      value={contentSearch}
                      onChange={(e) => setContentSearch(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2]"
                    />
                  </div>

                  {/* Expand / Collapse Toggle */}
                  <button
                    onClick={() =>
                      setIsActive(
                        isActive.length > 0 ? [] : (course.courseContent || []).map((s) => s._id)
                      )
                    }
                    className="text-xs font-bold text-[#3BA7F2] hover:underline whitespace-nowrap cursor-pointer"
                  >
                    {isActive.length > 0 ? "Collapse All" : "Expand All"}
                  </button>
                </div>
              </div>

              {/* Sections Accordion List */}
              {displayedSections.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {displayedSections.map((section) => (
                    <CourseAccordionBar
                      key={section._id || section.id}
                      course={section}
                      isActive={isActive}
                      handleActive={handleActive}
                      courseId={course._id || course.id}
                      isEnrolled={isEnrolled}
                      handlePromptBuy={handlePromptBuy}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  No sections match your search query.
                </div>
              )}

              {/* Show All Modules Button */}
              {filteredSections.length > 4 && (
                <div className="pt-3 text-center">
                  <button
                    onClick={() => setShowAllModules(!showAllModules)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer border border-gray-200"
                  >
                    <span>{showAllModules ? "Show less modules" : "Show all modules"}</span>
                    {showAllModules ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>
              )}
            </div>

            {/* 4. INSTRUCTORS SECTION */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-lg font-bold text-[#0F172A]">Our Instructors</h2>
              <p className="text-xs text-gray-500 font-normal">
                Passionate mentors dedicated to fueling your tech journey.
              </p>

              <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4">
                <img
                  src={instructorInfo.image}
                  alt={instructorInfo.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shrink-0"
                />

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-[#0F172A]">
                      {instructorInfo.name}
                    </h3>
                    <span className="text-[10px] font-bold text-[#3BA7F2] bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      Lead Instructor
                    </span>
                  </div>

                  <p className="text-xs font-medium text-gray-600">
                    {instructorInfo.designation}
                  </p>

                  <p className="text-xs text-gray-500 leading-relaxed font-normal pt-1">
                    {instructorInfo.bio}
                  </p>
                </div>
              </div>
            </div>

            {/* 5. SUCCESS STORIES / REVIEWS SECTION */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">Our Success Stories</h2>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">
                    Discover inspiration and insights through real student feedback.
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <FiStar className="fill-amber-400" />
                  <span>{ratingScore} ({reviewCount} Reviews)</span>
                </div>
              </div>

              {course.ratingAndReviews && course.ratingAndReviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {course.ratingAndReviews.map((rev, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#0F172A]">
                          {rev.user?.firstName || "Student"} {rev.user?.lastName || ""}
                        </span>
                        <div className="flex items-center text-amber-400 text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar
                              key={i}
                              className={i < Math.floor(rev.rating || 5) ? "fill-amber-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-normal leading-relaxed">
                        "{rev.review}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-400 italic">
                  No reviews yet. Be the first student to review this course!
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDEBAR: FLOATING / STICKY PURCHASE CARD */}
          <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-6">
            <CourseDetailsCard
              course={course}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </div>

        </div>
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
};

export default CourseDetails;
