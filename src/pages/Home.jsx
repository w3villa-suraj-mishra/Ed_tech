import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import HighLightText from '../components/core/HomePage/HighLightText';
import CTAButton from "../components/core/HomePage/Button";
import CodeBlocks from '../components/core/HomePage/CodeBlocks';
import TimelineSection from '../components/core/HomePage/TimelineSection';
import LearningLanguageSection from '../components/core/HomePage/LearningLanguageSection';
import InstructorSection from '../components/core/HomePage/InstructorSection';
import ExploreMore from '../components/core/HomePage/ExploreMore';
import Reviewslider from '../components/Common/Reviewslider';
import HeroStudentImgWebp from "../assests/Images/hero_student_learning.webp";
import HeroStudentImgJpg from "../assests/Images/hero_student_learning.jpg";
import CTAIllustrationImgWebp from "../assests/Images/cta_illustration.webp";
import CTAIllustrationImgPng from "../assests/Images/cta_illustration.png";
import InstructorSlider from '../components/core/HomePage/InstructorSlider';
import { getUserEnrolledCourses } from '../services/operations/profileAPI';
import { getHomePageStats, fetchCourseCategories, getAllCourses } from '../services/operations/courseDetailsAPI';

import {
  FiPlayCircle,
  FiUsers,
  FiUser,
  FiBookOpen,
  FiBarChart2,
  FiSmartphone,
  FiStar,
  FiChevronDown,
  FiArrowRight,
  FiSearch,
  FiX,
  FiGrid,
  FiHelpCircle,
  FiBriefcase
} from "react-icons/fi";
import { FaRocket, FaPenNib, FaDatabase, FaBrain, FaCrown, FaGraduationCap } from "react-icons/fa";

// Helper function to format numbers dynamically
const formatStatNumber = (num, defaultLabel = "0") => {
  if (num === null || num === undefined) return defaultLabel;
  if (typeof num === 'string' && isNaN(Number(num))) return num;
  const n = Number(num);
  if (n === 0) return "0";
  if (n >= 1000000) {
    const formatted = (n / 1000000).toFixed(1).replace(/\.0$/, '');
    return `${formatted}M+`;
  }
  if (n >= 1000) {
    const formatted = (n / 1000).toFixed(1).replace(/\.0$/, '');
    return `${formatted}K+`;
  }
  return `${n}+`;
};

// Category design presets matching the user's exact reference screenshot
const categoryDesignPresets = [
  {
    name: "Web Development",
    type: "code",
    description: "Learn full-stack web development with modern tools and frameworks.",
    courseCount: "2+",
    gradient: "from-[#93C5FD] via-[#60A5FA] to-[#3BA7F2]",
    glowShadow: "shadow-[0_8px_20px_rgba(59,130,246,0.3)]",
    pillBg: "bg-[#EFF6FF] text-[#3BA7F2] border-[#DBEAFE]"
  },
  {
    name: "Data Science",
    type: "chart",
    description: "Master data analysis, machine learning, and visualization.",
    courseCount: "2+",
    gradient: "from-[#E9D5FF] via-[#C084FC] to-[#A855F7]",
    glowShadow: "shadow-[0_8px_20px_rgba(168,85,247,0.3)]",
    pillBg: "bg-[#FAF5FF] text-[#9333EA] border-[#F3E8FF]"
  },
  {
    name: "Mobile Development",
    type: "mobile",
    description: "Build stunning iOS and Android apps for real-world use.",
    courseCount: "1+",
    gradient: "from-[#A7F3D0] via-[#34D399] to-[#10B981]",
    glowShadow: "shadow-[0_8px_20px_rgba(16,185,129,0.3)]",
    pillBg: "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]"
  },
  {
    name: "UI/UX Design",
    type: "pen",
    description: "Create beautiful and user-friendly interfaces that make an impact.",
    courseCount: "1+",
    gradient: "from-[#FED7AA] via-[#FB923C] to-[#F97316]",
    glowShadow: "shadow-[0_8px_20px_rgba(249,115,22,0.3)]",
    pillBg: "bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]"
  },
  {
    name: "Data Structures & Algorithms",
    type: "database",
    description: "Learn problem solving and coding interview concepts.",
    courseCount: "1+",
    gradient: "from-[#FECDD3] via-[#FB7185] to-[#F43F5E]",
    glowShadow: "shadow-[0_8px_20px_rgba(244,63,94,0.3)]",
    pillBg: "bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]"
  },
  {
    name: "Machine Learning",
    type: "brain",
    description: "Build models and intelligent systems using real data.",
    courseCount: "1+",
    gradient: "from-[#DDD6FE] via-[#A78BFA] to-[#13AA92]",
    glowShadow: "shadow-[0_8px_20px_rgba(124,58,237,0.3)]",
    pillBg: "bg-[#13AA92]/10 text-[#13AA92] border-[#13AA92]/30"
  }
];

const renderCategoryIcon = (type) => {
  switch (type) {
    case "code":
      return <span className="font-mono font-black text-xl text-white select-none drop-shadow-xs">&lt;/&gt;</span>;
    case "chart":
      return <FiBarChart2 className="text-2xl text-white drop-shadow-xs" />;
    case "mobile":
      return <FiSmartphone className="text-2xl text-white drop-shadow-xs" />;
    case "pen":
      return <FaPenNib className="text-xl text-white drop-shadow-xs" />;
    case "database":
      return <FaDatabase className="text-xl text-white drop-shadow-xs" />;
    case "brain":
      return <FaBrain className="text-2xl text-white drop-shadow-xs" />;
    default:
      return <span className="font-mono font-black text-xl text-white select-none drop-shadow-xs">&lt;/&gt;</span>;
  }
};

// Default featured courses matching user reference screenshot
const defaultFeaturedCourses = [
  {
    id: "feat-1",
    courseName: "Complete React Native Mobile Development",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
    badge: "BESTSELLER",
    badgeColor: "bg-[#3BA7F2]",
    instructor: "Senior Instructor",
    rating: "4.8",
    reviewsCount: "1.2K",
    price: "3649"
  },
  {
    id: "feat-2",
    courseName: "Blockchain & Ethereum Smart Contract Engineering",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
    badge: "MOST POPULAR",
    badgeColor: "bg-[#3BA7F2]",
    instructor: "Senior Instructor",
    rating: "4.9",
    reviewsCount: "1.6K",
    price: "3299"
  },
  {
    id: "feat-3",
    courseName: "Data Analytics with SQL, Tableau and PowerBI",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    badge: "TRENDING",
    badgeColor: "bg-[#3BA7F2]",
    instructor: "Senior Instructor",
    rating: "4.8",
    reviewsCount: "2.0K",
    price: "2949"
  },
  {
    id: "feat-4",
    courseName: "Vue.js 3 & Nuxt Fullstack Mastery",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    badge: "TOP RATED",
    badgeColor: "bg-[#13AA92]",
    instructor: "Senior Instructor",
    rating: "4.9",
    reviewsCount: "2.4K",
    price: "2599"
  }
];

const faqData = [
  {
    question: "Are the courses suitable for complete beginners?",
    answer: "Yes, absolutely. Every foundational learning track starts from ground zero with crystal-clear explanations, interactive sandbox exercises, and step-by-step guidance. No prior coding experience is required."
  },
  {
    question: "Will I receive a verified certificate upon completion?",
    answer: "Yes. Every student who successfully completes a course and its associated capstone practice tests receives a cryptographically verifiable certificate with a unique public URL that you can share on LinkedIn and your resume."
  },
  {
    question: "How does the interactive coding environment work?",
    answer: "Our cloud sandbox runs directly inside your modern browser. You don't need to install node, compilers, or local packages. You write code, run automated tests, and receive immediate console diagnostics in seconds."
  },
  {
    question: "Can I access course content on mobile and tablet devices?",
    answer: "Yes! The entire CodeLearn platform is fully responsive and optimized for smartphones and tablets, allowing you to watch lectures, review documentation, and take quizzes wherever you are."
  },
  {
    question: "What is your refund and satisfaction policy?",
    answer: "We offer a hassle-free 14-day satisfaction guarantee on all course enrollments. If a course does not meet your expectations, you can request a full refund directly from your account settings."
  }
];

const Home = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [hasActiveCourses, setHasActiveCourses] = useState(false);
  const [stats, setStats] = useState({
    learnersCount: null,
    coursesCount: null,
    projectsCount: null,
    certificationsCount: null,
    hoursLearned: null,
    averageRating: null
  });
  const [dbCategories, setDbCategories] = useState([]);
  const [categoryCount, setCategoryCount] = useState(null);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [showAllCatModal, setShowAllCatModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);
  const [isHeroImgLoaded, setIsHeroImgLoaded] = useState(false);
  const heroImgRef = useRef(null);

  useEffect(() => {
    if (heroImgRef.current && heroImgRef.current.complete) {
      setIsHeroImgLoaded(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Fetch independent homepage data in parallel.
    getHomePageStats().then(statsData => {
      if (isMounted && statsData) {
        setStats({
          learnersCount: statsData.learnersCount,
          coursesCount: statsData.coursesCount,
          projectsCount: statsData.projectsCount,
          certificationsCount: statsData.certificationsCount,
          hoursLearned: statsData.hoursLearned,
          averageRating: statsData.averageRating
        });
      }
    });

    // The categories response includes totalCategories, so no second count request is needed.
    fetchCourseCategories(1, 6).then(catData => {
      if (isMounted && catData && Array.isArray(catData)) {
        setDbCategories(catData);
        if (catData.totalCategories !== undefined) {
          setCategoryCount(catData.totalCategories);
        }
      }
    });

    // Fetch featured courses independently.
    getAllCourses().then(coursesData => {
      if (isMounted && coursesData && Array.isArray(coursesData)) {
        setFeaturedCourses(coursesData.slice(0, 4));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Merge backend categories with visual presets dynamically
  const popularCategoriesList = (dbCategories.length > 0 ? dbCategories : categoryDesignPresets).slice(0, 6).map((cat, idx) => {
    const preset = categoryDesignPresets.find(p => p.name.toLowerCase() === (cat.name || '').toLowerCase()) || categoryDesignPresets[idx % categoryDesignPresets.length];
    const categoryId = cat._id || cat.id;
    const categorySlug = (cat.name || preset.name).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const targetLink = categoryId ? `/courses?category=${categoryId}` : `/courses?category=${categorySlug}`;
    
    // Display exact course count
    let countDisplay = `${preset.courseCount} Courses`;
    if (cat.courseCount !== undefined && cat.courseCount > 0) {
      countDisplay = `${cat.courseCount}+ Courses`;
    } else if (cat.courses && cat.courses.length > 0) {
      countDisplay = `${cat.courses.length}+ Courses`;
    }

    return {
      _id: categoryId,
      name: cat.name || preset.name,
      description: cat.description || preset.description,
      type: preset.type,
      gradient: preset.gradient,
      glowShadow: preset.glowShadow,
      pillBg: preset.pillBg,
      courseCount: countDisplay,
      link: targetLink
    };
  });

  // Featured courses mapped completely dynamically from the backend
  const displayFeaturedCourses = featuredCourses.slice(0, 4).map((course, idx) => {
    // We can still use the static badges/colors as visual presets if the backend doesn't provide them
    const presetBadge = defaultFeaturedCourses[idx % defaultFeaturedCourses.length]?.badge || "FEATURED";
    const presetColor = defaultFeaturedCourses[idx % defaultFeaturedCourses.length]?.badgeColor || "bg-[#3BA7F2]";
    
    return {
      id: course._id || course.id,
      courseName: course.courseName || "Untitled Course",
      thumbnail: course.thumbnail || "",
      badge: presetBadge,
      badgeColor: presetColor,
      instructor: course.instructor ? `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim() : "Unknown Instructor",
      rating: course.rating !== undefined ? course.rating : "0.0",
      reviewsCount: course.reviewsCount !== undefined ? course.reviewsCount : "0",
      price: course.price !== undefined ? course.price : "0"
    };
  });

  useEffect(() => {
    let isMounted = true;
    const checkEnrollment = async () => {
      if (token) {
        try {
          const enrolled = await getUserEnrolledCourses(token);
          if (isMounted) {
            if (enrolled && Array.isArray(enrolled)) {
              const validCourses = enrolled.filter((item) => {
                const courseObj = item?.course || item;
                const plan = item?.plan || courseObj?.plan;
                const expiresAt = item?.expiresAt || courseObj?.expiresAt;

                if (plan === 'silver' && expiresAt) {
                  return new Date(expiresAt) > new Date();
                }
                return true;
              });
              setHasActiveCourses(validCourses.length > 0);
            } else {
              setHasActiveCourses(false);
            }
          }
        } catch (err) {
          if (isMounted) setHasActiveCourses(false);
        }
      } else {
        if (isMounted) setHasActiveCourses(false);
      }
    };

    checkEnrollment();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Primary CTA Logic
  let primaryText = "Explore All Courses";
  let primaryLink = "/courses";

  if (token) {
    if (hasActiveCourses) {
      primaryText = "Continue Learning";
      primaryLink = "/t/u/activeCourses";
    } else {
      primaryText = "Start Learning";
      primaryLink = "/courses";
    }
  }

  const filteredModalCategories = (dbCategories.length > 0 ? dbCategories : categoryDesignPresets).filter(cat => 
    (cat.name || "").toLowerCase().includes(categorySearch.toLowerCase()) ||
    (cat.description || "").toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="w-full homepage_bg text-[#111827] font-sans antialiased overflow-hidden flex flex-col gap-[30px] relative">
      
      {/* Dynamic Floating Ambient Glass Orbs in Background */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none animate-orb-1 -z-10" />
      <div className="absolute top-[600px] right-5 w-[600px] h-[600px] bg-purple-400/15 rounded-full blur-[140px] pointer-events-none animate-orb-2 -z-10" />
      <div className="absolute top-[1500px] left-1/4 w-[550px] h-[550px] bg-teal-400/15 rounded-full blur-[130px] pointer-events-none animate-orb-3 -z-10" />
      <div className="absolute top-[2600px] right-10 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none animate-orb-1 -z-10" />

      {/* ========================================================
          HERO / TOP SECTION (GLASSMORPHISM REDESIGN)
      ======================================================== */}
      <section className="relative py-8 sm:py-12">
        {/* Subtle Contour Background Overlay */}
        <div className="absolute inset-0 pointer-events-none -z-10 opacity-30 overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="contour-lines" width="160" height="160" patternUnits="userSpaceOnUse">
                <path d="M 0 80 Q 40 50, 80 80 T 160 80" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 0 130 Q 40 100, 80 130 T 160 130" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
                <circle cx="80" cy="80" r="1.5" fill="#3BA7F2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contour-lines)" />
          </svg>
        </div>

        <div className="w-11/12 max-w-maxContent mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-14">
            
            {/* Left Column: Copy, Actions & Stats */}
            <div className="w-full lg:w-[48%] flex flex-col items-start text-left">
              
              {/* Top Badge: #1 Platform to Learn Coding */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-[#13AA92] text-xs font-semibold shadow-sm mb-6 border border-white/80">
                <FaCrown className="text-xs text-[#13AA92]" />
                <span>#1 Platform to Learn Coding</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] font-black text-gray-900 tracking-tight leading-[1.12]">
                Empower Your Future <br className="hidden sm:block" />
                With <span className="accent-gradient-text">Coding Skills</span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="mt-5 text-base sm:text-lg text-[#475569] font-normal leading-relaxed max-w-lg">
                Learn from industry experts, build real projects, and accelerate your career with our hands-on coding courses.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-8 w-full sm:w-auto">
                <Link to={primaryLink} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex justify-center items-center gap-2 bg-[#3BA7F2]/90 hover:bg-[#3BA7F2] backdrop-blur-md text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-2xl border border-white/30 shadow-[0_8px_25px_rgba(59,167,242,0.35)] transition-all duration-300 hover:scale-105 active:scale-95">
                    <span>{primaryText}</span>
                    <span>→</span>
                  </button>
                </Link>

                <Link to="/courses" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white/70 hover:bg-white/90 backdrop-blur-md text-[#3BA7F2] font-bold text-sm sm:text-base px-8 py-3.5 rounded-2xl border border-white/80 shadow-sm transition-all duration-300 hover:scale-105 active:scale-95">
                    <span>Explore Courses</span>
                  </button>
                </Link>
              </div>

              {/* Horizontal Stats Row directly below buttons - Frosted Glass Container */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 pb-4 px-5 mt-8 glass-card rounded-2xl border border-white/70 w-full shadow-sm">
                {/* Stat 1: Students */}
                <div className="flex items-center gap-3 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#3BA7F2] flex items-center justify-center text-base shrink-0 group-hover:bg-[#3BA7F2] group-hover:text-white transition-all duration-300 shadow-2xs">
                    <FiUsers />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-black text-gray-900 leading-tight group-hover:text-[#3BA7F2] transition-colors">
                      {stats.learnersCount !== null && stats.learnersCount !== undefined ? formatStatNumber(stats.learnersCount, "0") : "0"}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">Students</span>
                  </div>
                </div>

                {/* Stat 2: Courses */}
                <div className="flex items-center gap-3 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-base shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                    <FiBookOpen />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-black text-gray-900 leading-tight group-hover:text-purple-600 transition-colors">
                      {stats.coursesCount !== null && stats.coursesCount !== undefined ? formatStatNumber(stats.coursesCount, "0") : "0"}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">Courses</span>
                  </div>
                </div>

                {/* Stat 3: Hours Learned */}
                <div className="flex items-center gap-3 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-base shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                    <FiPlayCircle />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-black text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors">
                      {stats.hoursLearned !== null && stats.hoursLearned !== undefined ? formatStatNumber(stats.hoursLearned, "0") : "0"}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">Hours Learned</span>
                  </div>
                </div>

                {/* Stat 4: Student Rating */}
                <div className="flex items-center gap-3 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-base shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-2xs">
                    <FiStar className="group-hover:fill-white fill-transparent transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-black text-gray-900 leading-tight group-hover:text-amber-500 transition-colors">
                      {stats.averageRating !== null && stats.averageRating !== undefined ? stats.averageRating : "0.0"}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">Average Rating</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual with Overlapping Floating Glass Badges */}
            <div className="w-full lg:w-[50%] relative flex justify-center items-center mt-6 lg:mt-0">
              
              {/* Playful Doodle Annotation (Top Right) */}
              <div className="absolute -top-6 right-2 sm:right-4 z-20 pointer-events-none hidden sm:flex flex-col items-center">
                <svg className="w-14 h-10 text-indigo-400 -mb-2" viewBox="0 0 50 35" fill="none" stroke="currentColor">
                  <path d="M5 25 C 15 5, 35 5, 45 20" strokeWidth="2" strokeDasharray="3 3" />
                  <path d="M40 22 L 46 20 L 44 14" strokeWidth="2" />
                </svg>
                <div className="text-[11px] font-bold text-indigo-800 glass-pill px-3 py-1 rounded-full shadow-md rotate-6 border border-white/80">
                  Your Future Starts Here
                </div>
              </div>

              {/* Main Photo Card with Glass Glow Border */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/80 backdrop-blur-md aspect-[4/3.2] max-w-[530px] w-full bg-slate-200/50">
                {/* Instant Blurred LQIP Placeholder */}
                <img
                  src="data:image/webp;base64,UklGRqIAAABXRUJQVlA4IJYAAAAwBQCdASoYABIAPzmQu1gvKaWjqAqp4CcJQBUegYs7bxtOW9fVxH5/z9wltc/OLKnIQAD+1Z1CK6bU+cKSy19EVqSkIlnV33q84M9+4ZVqTWecXaMUZvEQIZ5GopbtucZ/M/dlh2EsNLaI845B727iwh8SmxMK/hRpzaY5HLE0Y9sc44igkwFLjlna0xSXOTEIIAQAAAA="
                  alt=""
                  aria-hidden="true"
                  className={`absolute inset-0 w-full h-full object-cover filter blur-md scale-105 pointer-events-none transition-opacity duration-500 ${
                    isHeroImgLoaded ? "opacity-0" : "opacity-100"
                  }`}
                />

                {/* Full Resolution Preloaded WebP with Fallback */}
                <picture className="w-full h-full block relative z-10">
                  <source type="image/webp" srcSet={`${process.env.PUBLIC_URL || ""}/hero_student_learning.webp`} />
                  <source type="image/webp" srcSet={HeroStudentImgWebp} />
                  <img
                    ref={heroImgRef}
                    src={HeroStudentImgJpg}
                    alt="Student learning coding on CodeLearn"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    width="530"
                    height="424"
                    onLoad={() => setIsHeroImgLoaded(true)}
                    className={`w-full h-full object-cover transform hover:scale-102 transition-opacity duration-300 ${
                      isHeroImgLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </picture>
              </div>

              {/* Floating Badge 1 (Top Left Overlapping Main Photo): Glass Progress Card */}
              <div className="absolute -top-4 left-0 sm:-top-6 sm:-left-6 glass-card rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-white/80 flex items-center gap-3 z-20">
                <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-indigo-100/60"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#3BA7F2]"
                      strokeDasharray="73, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-[#3BA7F2]">73%</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-[#3BA7F2] tracking-wider uppercase">Keep Learning!</span>
                  <span className="text-xs font-bold text-gray-900 leading-tight">Web Development</span>
                  <span className="text-[10px] text-gray-500 font-medium mt-0.5">73% complete</span>
                </div>
              </div>

              {/* Floating Badge 2 (Bottom Left Overlapping Main Photo): Frosted Dark Code Snippet */}
              <div className="absolute -bottom-6 left-0 sm:-left-6 glass-card-dark text-white rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-white/10 z-20 font-mono text-xs w-[210px] sm:w-[230px] text-left">
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <p><span className="text-[#3BA7F2] font-semibold">const</span> <span className="text-blue-300">learn</span> = () =&gt; &#123;</p>
                  <p className="pl-4 text-emerald-300">&#160;return <span className="text-amber-300">"Better Future"</span>;</p>
                  <p>&#125;</p>
                </div>
              </div>

              {/* Floating Badge 3 (Bottom Right Overlapping Main Photo): Frosted Glass Build Card */}
              <div className="absolute bottom-4 right-0 sm:-right-6 glass-card rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-white/80 z-20 flex flex-col items-center justify-center text-center w-[85px] sm:w-[95px]">
                <div className="w-7 h-7 rounded-full bg-indigo-50 text-[#3BA7F2] flex items-center justify-center text-xs mb-1.5 shadow-2xs">
                  📍
                </div>
                <span className="text-xs font-black text-gray-900 leading-tight">Build</span>
                <span className="text-xs font-black text-[#3BA7F2] leading-tight">Create</span>
                <span className="text-xs font-black text-blue-600 leading-tight">Grow</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          POPULAR CATEGORIES SECTION (MATCHING REFERENCE DESIGN)
      ======================================================== */}
      <section className="relative w-11/12 max-w-maxContent mx-auto text-center overflow-hidden py-[15px]">
        
        {/* Sketched Doodle Top-Left: Learn Without Limits */}
        <div className="hidden lg:flex flex-col items-center absolute top-0 left-6 xl:left-14 pointer-events-none select-none -rotate-6">
          <span className="font-serif italic font-bold text-xs sm:text-sm text-[#3BA7F2] tracking-wide text-center leading-tight">
            Learn<br />Without Limits
          </span>
          <svg className="w-9 h-9 text-[#A78BFA] mt-1 ml-5 -rotate-12" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4 C 14 16, 20 22, 30 28" />
            <path d="M22 29 L 30 28 L 28 18" />
          </svg>
        </div>

        {/* Sketched Doodle Top-Right: Build Your Future */}
        <div className="hidden lg:flex flex-col items-center absolute top-0 right-6 xl:right-14 pointer-events-none select-none rotate-6">
          <span className="font-serif italic font-bold text-xs sm:text-sm text-[#3BA7F2] tracking-wide text-center leading-tight">
            Build<br />Your Future
          </span>
          <svg className="w-9 h-9 text-[#A78BFA] mt-1 mr-5 rotate-12" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M32 4 C 22 16, 16 22, 6 28" />
            <path d="M14 29 L 6 28 L 8 18" />
          </svg>
        </div>

        {/* Header Content */}
        <div className="max-w-2xl mx-auto space-y-2.5 relative z-10 pt-[60px]">
          <div className="inline-flex items-center gap-1.5 glass-pill text-[#13AA92] text-xs font-semibold px-4 py-1.5 rounded-full mb-2 shadow-sm border border-white/80">
            <FiGrid className="text-xs text-[#13AA92]" />
            <span>Domain Specializations</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Explore Popular <span className="accent-gradient-text">Categories</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto font-normal leading-relaxed">
            Acquire deep specialized skills across the most critical technological domains in modern engineering.
          </p>
        </div>

        {/* 6 Category Cards Grid - Glassmorphism cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-4 xl:gap-5 mt-8 sm:mt-12 relative z-10">
          {popularCategoriesList.map((cat, idx) => {
            return (
              <Link
                key={cat._id || idx}
                to={cat.link}
                className="group glass-card glass-card-hover rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between text-left shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 relative border border-white/80"
              >
                <div>
                  {/* Top Squircle Icon */}
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${cat.gradient} ${cat.glowShadow} flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105 shadow-sm`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />
                    <div className="scale-75 sm:scale-100 flex items-center justify-center">
                      {renderCategoryIcon(cat.type)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-[12px] sm:text-[15px] font-bold text-[#0F172A] mt-3 sm:mt-5 leading-snug group-hover:text-[#13AA92] transition-colors line-clamp-2 sm:line-clamp-1">
                    {cat.name}
                  </h3>

                  {/* Subtitle / Description */}
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2 leading-relaxed line-clamp-2 min-h-[30px] sm:min-h-[38px]">
                    {cat.description}
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between mt-3 sm:mt-5 pt-1">
                  <span className={`text-[9px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full border ${cat.pillBg} whitespace-nowrap`}>
                    {cat.courseCount}
                  </span>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 rounded-full bg-white/80 border border-white/90 flex items-center justify-center text-gray-600 shadow-2xs group-hover:bg-[#3BA7F2] group-hover:text-white group-hover:translate-x-0.5 transition-all ml-1">
                    <FiArrowRight className="text-[10px] sm:text-xs" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Categories Button & Sketched Doodle */}
        <div className="mt-12 flex flex-col items-center justify-center relative z-10">
          <Link
            to="/categories"
            className="relative inline-flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md text-white text-xs sm:text-sm font-semibold px-8 py-3.5 rounded-full border border-white/20 shadow-[0_12px_28px_rgba(15,23,42,0.2)] hover:shadow-[0_16px_36px_rgba(59,167,242,0.35)] transition-all duration-300 hover:scale-105 group"
          >
            <span>View All Categories {categoryCount !== null ? `(${categoryCount})` : (dbCategories.length > 0 ? `(${dbCategories.length})` : '')}</span>
            <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Sketched text below button */}
          <div className="flex items-center justify-center gap-2 mt-3.5 text-xs text-[#3BA7F2]/90 font-serif italic select-none">
            <svg className="w-5 h-3 text-[#C4B5FD]" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 6 L 14 6 M 6 2 L 2 6 L 6 10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>More skills. A brighter future.</span>
            <svg className="w-5 h-3 text-[#C4B5FD]" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6 L 6 6 M 14 2 L 18 6 L 14 10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Bottom-Left Dot Matrix Pattern */}
        <div className="absolute bottom-6 left-6 pointer-events-none hidden lg:block opacity-40 select-none">
          <svg width="64" height="48" viewBox="0 0 64 48" fill="none">
            {[0, 16, 32, 48].map((x) =>
              [0, 16, 32].map((y) => (
                <circle key={`${x}-${y}`} cx={x + 6} cy={y + 6} r="2" fill="#94A3B8" />
              ))
            )}
          </svg>
        </div>

        {/* Bottom-Right Curved Flowing Waves & "Learn Grow Succeed" */}
        <div className="absolute bottom-4 right-6 pointer-events-none hidden lg:flex items-center gap-3 opacity-70 select-none">
          <svg className="w-44 h-16 text-[#C4B5FD]" viewBox="0 0 160 50" fill="none">
            <path d="M0 45 C 50 40, 90 15, 150 20" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M20 50 C 65 42, 105 25, 160 30" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="85" cy="30" r="3" fill="#3BA7F2" />
          </svg>
          <div className="text-[11px] font-serif italic text-[#3BA7F2] leading-tight text-left">
            <p>Learn</p>
            <p>Grow</p>
            <p>Succeed</p>
          </div>
        </div>
      </section>

      {/* ALL CATEGORIES MODAL (GLASSMORPHISM REDESIGN) */}
      {showAllCatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/85 backdrop-blur-2xl border border-white/80 max-w-4xl w-full rounded-3xl p-6 sm:p-8 text-gray-900 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Course Categories</h2>
                <p className="text-xs text-gray-500 mt-0.5">Explore tech domains, career pathways, and languages</p>
              </div>
              <button
                onClick={() => setShowAllCatModal(false)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-600 border border-gray-200/80 flex items-center justify-center text-sm transition-colors shadow-2xs"
                aria-label="Close modal"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {/* Modal Category Search */}
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search categories by keyword..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {filteredModalCategories.map((cat, idx) => {
                const preset = categoryDesignPresets.find(p => p.name.toLowerCase() === (cat.name || '').toLowerCase()) || categoryDesignPresets[idx % categoryDesignPresets.length];
                const categoryId = cat._id || cat.id;
                const categorySlug = (cat.name || preset.name).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                const targetLink = categoryId ? `/courses?category=${categoryId}` : `/courses?category=${categorySlug}`;
                const count = cat.courseCount !== undefined ? cat.courseCount : (cat.courses?.length || 0);

                return (
                  <Link
                    key={categoryId || idx}
                    to={targetLink}
                    onClick={() => setShowAllCatModal(false)}
                    className="glass-card hover:bg-white border border-white/80 rounded-2xl p-4 flex items-center gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${preset.gradient} ${preset.glowShadow} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      {renderCategoryIcon(preset.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs text-gray-900 group-hover:text-purple-600 truncate transition-colors">
                        {cat.name || preset.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 truncate">
                        {cat.description || preset.description}
                      </p>
                      <span className={`text-[10px] font-semibold inline-block mt-1 px-2 py-0.5 rounded-full border ${preset.pillBg}`}>
                        {count > 0 ? `${count}+ Courses` : `${preset.courseCount} Courses`}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3 SIMPLE STEPS SECTION (GLASSMORPHISM REDESIGN)
      ======================================================== */}
      <section className="w-11/12 max-w-maxContent mx-auto py-[15px]">
        <div className="rounded-3xl sm:rounded-[2.5rem] glass-card border border-white/80 shadow-xl p-8 sm:p-12 text-center w-full mx-auto">
          
          {/* Section Header */}
          <div className="max-w-xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Start Learning in <span className="accent-gradient-text">3 Simple Steps</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-2 font-normal">
              Your coding journey begins here.
            </p>
          </div>

          {/* Steps Timeline Grid with Dotted Lines */}
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 md:gap-6 w-full px-4 lg:px-20 mx-auto">
            
            {/* Desktop Dotted Connector Line */}
            <div className="hidden md:block absolute top-8 left-[18%] right-[18%] h-[2px] border-b-2 border-dotted border-blue-300 z-0 pointer-events-none"></div>

            {/* Step 1: Create Your Account */}
            <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[320px]">
              <div className="w-16 h-16 rounded-full glass-card border border-white/90 flex items-center justify-center text-[#3BA7F2] text-2xl shadow-lg transition-transform duration-300 hover:scale-110 mb-5">
                <FiUser />
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-extrabold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Create Your Account
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Sign up for free in seconds and set up your profile.
              </p>
            </div>

            {/* Step 2: Explore Courses */}
            <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[320px]">
              <div className="w-16 h-16 rounded-full glass-card border border-white/90 flex items-center justify-center text-purple-600 text-2xl shadow-lg transition-transform duration-300 hover:scale-110 mb-5">
                <FiBookOpen />
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-extrabold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Explore Courses
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Browse our curated courses and choose what to learn.
              </p>
            </div>

            {/* Step 3: Start & Grow */}
            <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[320px]">
              <div className="w-16 h-16 rounded-full glass-card border border-white/90 flex items-center justify-center text-emerald-600 text-2xl shadow-lg transition-transform duration-300 hover:scale-110 mb-5">
                <FaRocket className="text-xl" />
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-extrabold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Start & Grow
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Learn, build projects and earn certificates.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          HANDS-ON CODE PLAYGROUND SECTIONS (CodeBlocks 1 & 2)
      ======================================================== */}
      <section className="w-11/12 max-w-maxContent mx-auto py-[15px]">
        {/* Code Section 1 */}
        <CodeBlocks
          position={"lg:flex-row"}
          heading={
            <>
              Unlock Your <HighLightText text="Coding Potential" /> with In-Browser Labs
            </>
          }
          subheading={
            "Our interactive courses are designed and taught by senior industry engineers. Learn deep algorithmic paradigms and modern software design patterns with real-time feedback."
          }
          ctabtn1={{
            btnText: token ? (hasActiveCourses ? "Continue Learning" : "Start Learning") : "Explore Curriculum",
            linkto: token ? (hasActiveCourses ? "/t/u/activeCourses" : "/courses") : "/courses",
            active: true,
          }}
          ctabtn2={{
            btnText: "Learn More",
            linkto: "/about",
            active: false,
          }}
          codeblock={`// 🌐 Full-Stack Node & Express Controller
import { Request, Response } from 'express';
import { CourseModel } from '../models/course';

export const getEnrolledCourses = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const userCourses = await CourseModel.find({ studentsEnrolled: userId })
    .populate('instructor', 'name avatar')
    .sort({ updatedAt: -1 });

  return res.status(200).json({ success: true, data: userCourses });
};`}
          codeColor={"text-blue-300"}
        />

        {/* Code Section 2 */}
        <CodeBlocks
          position={"lg:flex-row-reverse"}
          heading={
            <>
              Start <HighLightText text="Coding in Seconds" /> — Zero Configuration
            </>
          }
          subheading={
            "Go ahead, write real code from lesson one. Our isolated browser execution engines eliminate tedious local development setup so you can focus entirely on problem-solving."
          }
          ctabtn1={{
            btnText: token ? (hasActiveCourses ? "Continue Lesson" : "Start Learning") : "Try Playground Free",
            linkto: token ? (hasActiveCourses ? "/t/u/activeCourses" : "/signup") : "/signup",
            active: true,
          }}
          ctabtn2={{
            btnText: "Browse Courses",
            linkto: "/courses",
            active: false,
          }}
          codeblock={`import React, { useState } from 'react';

export default function InteractiveCounter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 rounded-2xl bg-white shadow-md border">
      <h2 className="text-lg font-bold text-gray-900">Live Component</h2>
      <p className="text-sm text-gray-500 mt-1">Interactive state: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl"
      >
        Increment State
      </button>
    </div>
  );
}`}
          codeColor={"text-emerald-300"}
        />
      </section>

      {/* ========================================================
          CURATED LEARNING PATHWAYS (ExploreMore)
      ======================================================== */}
      <ExploreMore />

      {/* ========================================================
          TIMELINE & METHODOLOGY SECTION
      ======================================================== */}
      <section className="w-11/12 max-w-maxContent mx-auto border-t border-gray-200/60 py-[15px]">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="text-3xl sm:text-4xl font-bold text-gray-900 lg:w-1/2 tracking-tight leading-tight">
            Get the Skills You Need for a{" "}
            <br className="hidden sm:block" />
            <HighLightText text="Job That Is in Demand" />
          </div>
          <div className="lg:w-1/2 flex flex-col items-start gap-4">
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
              Modern tech hiring dictates its own terms. Today, standing out as a competitive software specialist requires more than isolated syntax knowledge—it demands architectural thinking and deep debugging competency.
            </p>
            <CTAButton active={true} linkto="/courses">
              <span>Explore Career Paths →</span>
            </CTAButton>
          </div>
        </div>

        <TimelineSection />
      </section>

      {/* ========================================================
          INTELLIGENT TOOLS SECTION (Swiss Knife)
      ======================================================== */}
      <LearningLanguageSection />

      {/* ========================================================
          FEATURED COURSES SECTION (GLASSMORPHISM REDESIGN)
      ======================================================== */}
      <section className="w-11/12 max-w-maxContent mx-auto text-center py-[15px]">
        
        {/* Header Content */}
        <div className="max-w-2xl mx-auto space-y-2.5 mb-12 text-center">
          <div className="inline-flex items-center gap-1.5 glass-pill text-[#13AA92] text-xs font-semibold px-4 py-1.5 rounded-full mb-2 shadow-sm border border-white/80">
            <FaCrown className="text-xs text-[#13AA92]" />
            <span>Top Rated</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Featured <span className="accent-gradient-text">Courses</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-600 font-normal max-w-xl mx-auto leading-relaxed">
            Hand-picked comprehensive tracks to kickstart your journey or accelerate your engineering career.
          </p>
        </div>

        {/* Featured Courses Grid: 4 Cards or Empty State */}
        {displayFeaturedCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {displayFeaturedCourses.map((course) => {
              return (
                <div
                  key={course.id}
                  onClick={() => navigate(course.id && !course.id.startsWith('feat-') ? `/courses/${course.id}` : '/courses')}
                  className="glass-card glass-card-hover rounded-3xl border border-white/80 shadow-lg hover:shadow-2xl hover:border-blue-400/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group"
                >
                  <div>
                    {/* Top Image & Badge */}
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100/50">
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black z-10 text-white tracking-wider uppercase shadow-md glass-pill border border-white/40 ${course.badgeColor || 'bg-[#3BA7F2]'}`}>
                        {course.badge}
                      </span>
                      <img
                        src={course.thumbnail}
                        alt={course.courseName}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Course Content */}
                    <div className="p-5">
                      <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 min-h-[44px] group-hover:text-[#3BA7F2] transition-colors">
                        {course.courseName}
                      </h3>

                      {/* Senior Instructor Badge */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-5 h-5 rounded-full bg-[#DC2626] text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">
                          SI
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {course.instructor}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Price Row */}
                  <div className="px-5 pb-5 pt-1 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-amber-400 text-sm">★</span>
                      <span className="font-bold text-gray-900">{course.rating}</span>
                      <span className="text-gray-400 font-normal">({course.reviewsCount})</span>
                    </div>
                    <div className="text-sm font-extrabold text-gray-900">
                      ₹{course.price}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-16 px-4 glass-card rounded-3xl border border-white/80">
            <div className="w-16 h-16 rounded-full glass-card border border-white/90 flex items-center justify-center text-gray-400 text-2xl mb-4 shadow-sm">
              <FiBookOpen />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1.5">No Featured Courses Yet</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              We are actively building our catalog. New and exciting courses will appear here soon!
            </p>
          </div>
        )}

        {/* View All Courses Button */}
        <div className="mt-12 flex justify-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-white/70 hover:bg-white backdrop-blur-md text-gray-800 border border-white/80 text-xs sm:text-sm font-semibold px-8 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <span>View All Courses</span>
            <FiArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ========================================================
          FACULTY & MENTOR SHOWCASE
      ======================================================== */}
      <InstructorSlider />

      {/* ========================================================
          INSTRUCTOR BANNER (Teach Millions)
      ======================================================== */}
      <InstructorSection />

      {/* ========================================================
          LEARNER REVIEWS & TESTIMONIALS
      ======================================================== */}
      <Reviewslider />

      {/* ========================================================
          FAQ ACCORDION SECTION (GLASSMORPHISM REDESIGN)
      ======================================================== */}
      <section className="w-11/12 max-w-maxContent mx-auto text-center border-t border-white/40 py-[15px]">
        <div className="max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 glass-pill text-[#13AA92] text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm border border-white/80">
            <FiHelpCircle className="text-xs text-[#13AA92]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Got Questions? We Have Answers.
          </h2>
          <p className="text-base text-gray-600 font-normal leading-relaxed">
            Everything you need to know about the CodeLearn curriculum, certification, and learning tools.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3 text-left">
          {faqData.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-white/80 overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left gap-4 hover:bg-white/40 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-gray-900">
                    {faq.question}
                  </span>
                  <FiChevronDown
                    className={`text-gray-400 text-lg transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-white/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          BOTTOM CONVERSION CTA BANNER (GLASSMORPHISM REDESIGN)
      ======================================================== */}
      <section className="w-11/12 max-w-maxContent mx-auto py-[15px]">
        <div className="rounded-3xl lg:rounded-[2.5rem] bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 backdrop-blur-2xl border border-white/80 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          
          {/* Ambient Glowing Background Blurs */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#3BA7F2]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 relative z-10">
            
            {/* Left Column: Copy, Actions & Metrics */}
            <div className="w-full lg:w-[48%] flex flex-col items-start text-left">
              
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 glass-pill text-[#13AA92] text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm mb-4 border border-white/80 select-none">
                <FaRocket className="text-xs text-[#13AA92]" />
                <span>Your Future Starts Here</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-black text-[#0F172A] tracking-tight leading-[1.12]">
                Accelerate Your <br />
                <span className="accent-gradient-text">
                  Tech Career Today
                </span>
              </h2>

              {/* Subtitle */}
              <p className="mt-2 text-xs sm:text-sm text-gray-600 font-normal leading-relaxed max-w-md">
                Join thousands of engineers who leveled up their skills, built production-grade apps, and landed top tech roles.
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full sm:w-auto">
                <Link to={token ? "/courses" : "/signup"} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex justify-center items-center gap-2 bg-[#3BA7F2]/90 hover:bg-[#3BA7F2] backdrop-blur-md text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-full border border-white/30 shadow-[0_8px_25px_rgba(59,167,242,0.45)] transition-all duration-300 hover:scale-105 active:scale-95">
                    <span>Get Started Free</span>
                    <FiArrowRight className="text-sm" />
                  </button>
                </Link>

                <Link to="/courses" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white/70 hover:bg-white/90 backdrop-blur-md text-[#3BA7F2] border border-white/80 font-bold text-xs sm:text-sm px-7 py-3 rounded-full shadow-sm transition-all duration-300 hover:scale-105 active:scale-95">
                    <span>Browse All Courses</span>
                    <FiArrowRight className="text-sm" />
                  </button>
                </Link>
              </div>

              {/* 4 Feature Micro-Metrics */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full glass-card text-[#3BA7F2] flex items-center justify-center text-xs shrink-0 shadow-sm border border-white/80">
                    <FaGraduationCap />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-xs font-bold text-gray-900">100K+</span>
                    <span className="block text-[11px] text-gray-500 font-medium">Learners</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full glass-card text-purple-600 flex items-center justify-center text-xs shrink-0 shadow-sm border border-white/80">
                    <FiBarChart2 />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-xs font-bold text-gray-900">Industry</span>
                    <span className="block text-[11px] text-gray-500 font-medium">Experts</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full glass-card text-emerald-600 flex items-center justify-center text-xs shrink-0 shadow-sm border border-white/80">
                    <FiBriefcase />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-xs font-bold text-gray-900">Real</span>
                    <span className="block text-[11px] text-gray-500 font-medium">Projects</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full glass-card text-amber-500 flex items-center justify-center text-xs shrink-0 shadow-sm border border-white/80">
                    <FiStar />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-xs font-bold text-gray-900">Better</span>
                    <span className="block text-[11px] text-gray-500 font-medium">Opportunities</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: 3D Workspace Composition & Badges Artwork */}
            <div className="w-full lg:w-[52%] flex items-center justify-center lg:justify-end">
              <picture className="w-full flex items-center justify-center lg:justify-end">
                <source type="image/webp" srcSet={CTAIllustrationImgWebp} />
                <img
                  src={CTAIllustrationImgPng}
                  alt="Accelerate Your Tech Career Today"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-h-[290px] sm:max-h-[320px] object-contain max-w-[540px] drop-shadow-md pointer-events-none select-none -hue-rotate-60"
                />
              </picture>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
