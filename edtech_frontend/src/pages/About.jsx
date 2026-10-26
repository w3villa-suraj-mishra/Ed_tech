import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomePageStats, fetchAllReviews } from '../services/operations/courseDetailsAPI';
import bannerImage1 from "../assests/Images/aboutus1.webp";
import bannerImage2 from "../assests/Images/aboutus2.webp";
import bannerImage3 from "../assests/Images/aboutus3.webp";
import FoundingStory from "../assests/Images/FoundingStory.png";
import { 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaBookOpen, 
  FaAward, 
  FaStar, 
  FaUsers, 
  FaRocket, 
  FaGlobe, 
  FaHeart, 
  FaBullseye, 
  FaCog 
} from 'react-icons/fa';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiStar } from 'react-icons/fi';

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

const defaultReviews = [
  {
    name: "Suraj Mishra",
    role: "Python Programming for Beginners",
    avatarBg: "bg-[#EC4899]",
    avatarInitial: "S",
    rating: 5.0,
    review: "This Python Programming course is well-structured and easy to understand. The lessons explain concepts clearly, with practical examples and exercises that make learning Python more engaging..."
  },
  {
    name: "Priya Sharma",
    role: "Full-Stack Web Mastery",
    avatarBg: "bg-[#3BA7F2]",
    avatarInitial: "P",
    rating: 5.0,
    review: "The curriculum depth and interactive sandbox projects were incredible. I went from struggling with basic JavaScript promises to deploying production microservices in 4 months."
  },
  {
    name: "David Kim",
    role: "DevOps & Cloud Infrastructure",
    avatarBg: "bg-[#3BA7F2]",
    avatarInitial: "D",
    rating: 5.0,
    review: "Hands down the best technical platform I have encountered. The mentor feedback was thorough, actionable, and focused on clean architectural design patterns."
  }
];

const About = () => {
  const [stats, setStats] = useState({
    learnersCount: null,
    coursesCount: null,
    projectsCount: null,
    certificationsCount: null
  });

  const [reviews, setReviews] = useState(defaultReviews);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      const statsData = await getHomePageStats();
      if (isMounted && statsData) {
        setStats({
          learnersCount: statsData.learnersCount,
          coursesCount: statsData.coursesCount,
          projectsCount: statsData.projectsCount,
          certificationsCount: statsData.certificationsCount
        });
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadReviews = async () => {
      try {
        const data = await fetchAllReviews();
        const list = Array.isArray(data) ? data : (data?.data || []);
        if (isMounted && list && list.length > 0) {
          const mapped = list.map((item, i) => {
            const user = item.user || {};
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Software Engineer';
            const colors = ["bg-[#EC4899]", "bg-[#3BA7F2]", "bg-[#3BA7F2]", "bg-[#10B981]", "bg-[#F59E0B]"];
            return {
              name: fullName,
              role: item.course?.courseName || user.accountType || 'Software Developer',
              avatarBg: colors[i % colors.length],
              avatarInitial: fullName.charAt(0).toUpperCase() || "L",
              rating: item.rating || 5.0,
              review: item.review || "CodeLearn helped me transition into a high-growth engineering role with complete confidence."
            };
          });
          setReviews([defaultReviews[0], ...mapped.slice(0, 4)]);
        }
      } catch (e) {
        // Fallback reviews stay
      }
    };
    loadReviews();
    return () => { isMounted = false; };
  }, []);

  const activeStudents = formatStatNumber(stats.learnersCount, "1+");
  const publishedCourses = formatStatNumber(stats.coursesCount, "21+");

  const nextReview = () => {
    setActiveReviewIdx((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setActiveReviewIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const currentReview = reviews[activeReviewIdx] || defaultReviews[0];

  return (
    <div className="w-full bg-[#F8FAFC] text-gray-900 font-sans min-h-screen pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1140px] mx-auto space-y-16 sm:space-y-20">

        {/* 1. HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#13AA92]/10 border border-[#13AA92]/30 text-[#3BA7F2] text-xs font-semibold w-fit shadow-2xs">
              <span className="text-xs">★</span>
              <span>About CodeLearn</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#0F172A] tracking-tight leading-[1.16]">
              Driving Innovation in Online Education for a{" "}
              <span className="text-[#3BA7F2]">Brighter Future.</span>
            </h1>

            <p className="text-xs sm:text-[13px] md:text-sm text-gray-500 leading-relaxed max-w-lg font-normal">
              At CodeLearn, we believe learning should be accessible, engaging, and future-ready. Our mission is to empower learners worldwide with the skills they need to build better careers and create a better world.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                Join Our Community
              </Link>
              <a
                href="#founding-story"
                className="px-5 py-2.5 rounded-xl bg-[#13AA92]/10 hover:bg-[#E0E7FF] border border-[#C7D2FE] text-[#3BA7F2] font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right Column: Image Collage & Floating Badge */}
          <div className="lg:col-span-6 relative flex justify-center items-center py-2">
            {/* Dot Matrix Decorations */}
            <div className="absolute -left-2 top-8 hidden sm:grid grid-cols-3 gap-2 opacity-35 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
              ))}
            </div>
            <div className="absolute -right-2 bottom-8 hidden sm:grid grid-cols-4 gap-2 opacity-35 pointer-events-none">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
              ))}
            </div>

            <div className="relative w-full max-w-[480px]">
              
              {/* Top Image: Woman with laptop */}
              <div className="w-[74%] h-[200px] sm:h-[225px] rounded-2xl overflow-hidden border-2 border-white shadow-md z-10 relative">
                <img
                  src={bannerImage1}
                  alt="Student learning with CodeLearn"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Badge (Happy Learners) */}
              <div className="absolute top-2 right-0 sm:right-2 z-20 bg-white/95 backdrop-blur-md border border-gray-200/90 px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center text-base shadow-2xs">
                  <FaGraduationCap />
                </div>
                <div className="text-left">
                  <div className="text-sm sm:text-base font-black text-[#0F172A] leading-none">{activeStudents}</div>
                  <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-tight mt-0.5">Happy Learners</div>
                </div>
                <span className="text-[#3BA7F2] text-xs font-bold self-start -mt-1">✦</span>
              </div>

              {/* Bottom Images Row */}
              <div className="flex items-end justify-between gap-3 -mt-6 sm:-mt-8 relative z-15">
                {/* Bottom-left: Team smiling at laptop */}
                <div className="w-[48%] h-[125px] sm:h-[145px] rounded-2xl overflow-hidden border-2 border-white shadow-md z-10">
                  <img
                    src={bannerImage2}
                    alt="Students collaborating"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bottom-right: Mug with books & plant */}
                <div className="w-[50%] h-[155px] sm:h-[180px] rounded-2xl overflow-hidden border-2 border-white shadow-md z-10">
                  <img
                    src={bannerImage3}
                    alt="Study desk"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2. STATS BAR */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-7 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          {/* Stat 1 */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center text-xl shrink-0">
              <FaGraduationCap />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#0F172A] leading-none">{activeStudents}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Active Students</div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center text-xl shrink-0">
              <FaUsers />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#0F172A] leading-none">10+</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Expert Instructors</div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center text-xl shrink-0">
              <FaBookOpen />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#0F172A] leading-none">{publishedCourses}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Courses</div>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center text-xl shrink-0">
              <FaAward />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#0F172A] leading-none">50+</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Awards</div>
            </div>
          </div>
        </section>

        {/* 3. OUR FOUNDING STORY */}
        <section id="founding-story" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs max-h-[350px]">
              <img
                src={FoundingStory}
                alt="Our Founding Story"
                className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-3.5 text-left">
            <span className="text-xs font-bold tracking-widest text-[#3BA7F2] uppercase block">Our Journey</span>
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#0F172A] tracking-tight">
              Our Founding Story
            </h2>
            <div className="space-y-3 text-xs sm:text-[13px] text-gray-500 leading-relaxed font-normal">
              <p>
                CodeLearn was born out of a shared vision and passion for transforming education. We recognized the gap between traditional learning and the real-world skills needed in today’s tech-driven world.
              </p>
              <p>
                A group of educators, developers, and industry professionals came together to create a platform that delivers high-quality, practical, and affordable learning to everyone, everywhere.
              </p>
              <p>
                From humble beginnings, we’ve grown into a trusted learning community empowering thousands of learners to achieve their dreams.
              </p>
            </div>
          </div>
        </section>

        {/* 4. OUR VISION & OUR MISSION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Our Vision Card */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-7 text-left shadow-xs hover:shadow-sm transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center text-2xl border border-[#13AA92]/30 mb-2">
              <FaBullseye />
            </div>
            <span className="text-[11px] font-extrabold tracking-widest text-[#3BA7F2] uppercase block">Our Vision</span>
            <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">Learn Without Limits</h3>
            <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed font-normal">
              Our vision is to create a world where anyone, anywhere can access quality education and build the skills to transform their lives. We aim to be the most trusted global platform for learners to grow, innovate, and lead.
            </p>
          </div>

          {/* Our Mission Card */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-7 text-left shadow-xs hover:shadow-sm transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center text-2xl border border-[#13AA92]/30 mb-2">
              <FaRocket />
            </div>
            <span className="text-[11px] font-extrabold tracking-widest text-[#3BA7F2] uppercase block">Our Mission</span>
            <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">Empower. Educate. Elevate.</h3>
            <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed font-normal">
              Our mission is to empower learners with industry-relevant skills through expertly designed courses, hands-on projects, and a supportive community — helping them achieve more in their personal and professional journeys.
            </p>
          </div>
        </section>

        {/* 5. CORE VALUES & LEARNING APPROACH */}
        <section className="space-y-8 text-center">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#3BA7F2] uppercase block">What Makes Us Different</span>
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#0F172A] tracking-tight mt-1">
              Our <span className="text-[#3BA7F2]">Core Values</span> & Learning Approach
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-center">
            {/* Card 1 */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 flex flex-col items-center gap-2.5 shadow-xs hover:shadow-sm hover:-translate-y-1 transition-all duration-200">
              <div className="w-10 h-10 rounded-full bg-[#3BA7F2] text-white flex items-center justify-center text-sm shadow-sm">
                <FaStar />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0F172A]">Quality First</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-normal">
                We ensure every course meets high standards and delivers real value.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 flex flex-col items-center gap-2.5 shadow-xs hover:shadow-sm hover:-translate-y-1 transition-all duration-200">
              <div className="w-10 h-10 rounded-full bg-[#3BA7F2] text-white flex items-center justify-center text-sm shadow-sm">
                <FaUsers />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0F172A]">Learner Centric</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-normal">
                Our learners are at the heart of everything we build and do.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 flex flex-col items-center gap-2.5 shadow-xs hover:shadow-sm hover:-translate-y-1 transition-all duration-200">
              <div className="w-10 h-10 rounded-full bg-[#3BA7F2] text-white flex items-center justify-center text-sm shadow-sm">
                <FaCog />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0F172A]">Practical Learning</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-normal">
                Learn by building real projects and solving real-world problems.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 flex flex-col items-center gap-2.5 shadow-xs hover:shadow-sm hover:-translate-y-1 transition-all duration-200">
              <div className="w-10 h-10 rounded-full bg-[#3BA7F2] text-white flex items-center justify-center text-sm shadow-sm">
                <FaGlobe />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0F172A]">Accessible for All</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-normal">
                We make quality education affordable and accessible to everyone.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 flex flex-col items-center gap-2.5 shadow-xs hover:shadow-sm hover:-translate-y-1 transition-all duration-200">
              <div className="w-10 h-10 rounded-full bg-[#3BA7F2] text-white flex items-center justify-center text-sm shadow-sm">
                <FaHeart />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0F172A]">Community Driven</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-normal">
                We grow together through collaboration, support, and shared success.
              </p>
            </div>
          </div>
        </section>

        {/* 6. LEARNER REVIEWS SLIDER */}
        <section className="relative overflow-hidden py-10 px-4 sm:px-6 rounded-3xl bg-gradient-to-b from-transparent via-[#EFF6FF]/60 to-[#EFF6FF]/90 text-center">
          <div className="max-w-2xl mx-auto space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#13AA92]/10 border border-[#13AA92]/30 text-[#3BA7F2] text-xs font-semibold shadow-2xs">
              <span className="text-xs">★</span>
              <span>Learner Community</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              What Our Learners Say
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
              Real career outcomes and experiences from engineers across the globe.
            </p>
          </div>

          <div className="max-w-[760px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Active Testimonial Card */}
            <div className="w-full sm:max-w-[540px] bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-7 shadow-xs text-left space-y-3.5 transition-all duration-300">
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="fill-amber-400" />
                ))}
                <span className="text-gray-500 font-bold text-xs ml-1.5">
                  {currentReview.rating.toFixed(1)}
                </span>
              </div>

              {/* Quote */}
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                “{currentReview.review}”
              </p>

              {/* Author Row */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className={`w-9 h-9 rounded-full ${currentReview.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0`}>
                  {currentReview.avatarInitial}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs sm:text-[13px] font-bold text-[#0F172A] truncate">
                      {currentReview.name}
                    </h4>
                    <FiCheckCircle className="text-[#3BA7F2] text-xs shrink-0" title="Verified Learner" />
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                    {currentReview.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Controls on Right */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevReview}
                  aria-label="Previous Review"
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 flex items-center justify-center text-sm shadow-2xs transition-all cursor-pointer hover:scale-105"
                >
                  <FiArrowLeft />
                </button>
                <button
                  onClick={nextReview}
                  aria-label="Next Review"
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 flex items-center justify-center text-sm shadow-2xs transition-all cursor-pointer hover:scale-105"
                >
                  <FiArrowRight />
                </button>
              </div>

              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {reviews.slice(0, 3).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveReviewIdx(idx)}
                    aria-label={`Go to review ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeReviewIdx === idx ? "w-4 bg-[#3BA7F2]" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
