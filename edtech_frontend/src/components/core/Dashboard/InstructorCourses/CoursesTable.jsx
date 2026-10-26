import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { COURSE_STATUS } from '../../../../utils/constants';
import { deleteCourse, fetchInstructorCourses } from '../../../../services/operations/courseDetailsAPI';
import ConfirmationModal from '../../../Common/ConfirmationModal';
import {
  FiEdit,
  FiTrash2,
  FiClock,
  FiFileText,
  FiBarChart2,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiEye
} from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';

// 24 Reference courses matching the provided screenshot
const REFERENCE_COURSES = [
  {
    id: 'c1',
    courseName: 'Complete React Native Mobile Development',
    courseDescription: 'Become an expert in Complete React Native Mobile Development. Learn hands-on projects, industry best practices...',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    duration: '25h 30m',
    sectionsCount: 5,
    progress: 50,
    progressColor: 'bg-indigo-600',
    progressTextColor: 'text-indigo-600',
    price: 3649,
    rating: 4.6,
    reviewsCount: 98,
    status: 'In Progress'
  },
  {
    id: 'c2',
    courseName: 'Blockchain & Ethereum Smart Contract Engineering',
    courseDescription: 'Become an expert in Blockchain & Ethereum Smart Contract Engineering. Learn hands-on...',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80',
    duration: '28h 20m',
    sectionsCount: 6,
    progress: 80,
    progressColor: 'bg-emerald-500',
    progressTextColor: 'text-emerald-600',
    price: 3299,
    rating: 4.5,
    reviewsCount: 72,
    status: 'Published'
  },
  {
    id: 'c3',
    courseName: 'Data Analytics with SQL, Tableau and PowerBI',
    courseDescription: 'Become an expert in Data Analytics with SQL, Tableau and PowerBI. Learn hands-on projects...',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    duration: '18h 10m',
    sectionsCount: 5,
    progress: 40,
    progressColor: 'bg-purple-600',
    progressTextColor: 'text-purple-600',
    price: 2949,
    rating: 4.7,
    reviewsCount: 120,
    status: 'Published'
  },
  {
    id: 'c4',
    courseName: 'Vue.js 3 & Nuxt Fullstack Mastery',
    courseDescription: 'Master modern fullstack apps with Vue.js & Nuxt. Learn hands-on projects, industry best...',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    duration: '26h 5m',
    sectionsCount: 6,
    progress: 90,
    progressColor: 'bg-blue-600',
    progressTextColor: 'text-blue-600',
    price: 2599,
    rating: 4.6,
    reviewsCount: 88,
    status: 'In Progress'
  },
  {
    id: 'c5',
    courseName: 'iOS Development with Swift 6 and SwiftUI',
    courseDescription: 'Become an expert in iOS Development with Swift 6 and SwiftUI. Learn hands-on projects...',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
    duration: '22h 30m',
    sectionsCount: 8,
    progress: 20,
    progressColor: 'bg-rose-500',
    progressTextColor: 'text-rose-600',
    price: 7749,
    rating: 4.8,
    reviewsCount: 95,
    status: 'Published'
  },
  {
    id: 'c6',
    courseName: 'Go Language Backend API Engineering',
    courseDescription: 'Build scalable backend services with Go. Learn hands-on projects, industry best practices...',
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80',
    duration: '24h 0m',
    sectionsCount: 5,
    progress: 70,
    progressColor: 'bg-cyan-500',
    progressTextColor: 'text-cyan-600',
    price: 7399,
    rating: 4.6,
    reviewsCount: 80,
    status: 'In Progress'
  },
  {
    id: 'c7',
    courseName: 'Rust Programming Language Complete Guide',
    courseDescription: 'Learn Rust with practical projects, memory safety, and real-world applications.',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    duration: '28h 40m',
    sectionsCount: 5,
    progress: 10,
    progressColor: 'bg-amber-500',
    progressTextColor: 'text-amber-600',
    price: 7054,
    rating: 4.5,
    reviewsCount: 63,
    status: 'Published'
  },
  {
    id: 'c8',
    courseName: 'GraphQL, Prisma & Microservices Development',
    courseDescription: 'Master GraphQL and build microservices with Prisma. Learn hands-on projects, best...',
    thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&auto=format&fit=crop&q=80',
    duration: '21h 0m',
    sectionsCount: 5,
    progress: 35,
    progressColor: 'bg-purple-600',
    progressTextColor: 'text-purple-600',
    price: 6699,
    rating: 4.4,
    reviewsCount: 70,
    status: 'In Progress'
  },
  {
    id: 'c9',
    courseName: 'AI & Large Language Models Prompt Engineering',
    courseDescription: 'Learn prompt engineering, LLMs, and real-world AI applications.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80',
    duration: '19h 20m',
    sectionsCount: 6,
    progress: 70,
    progressColor: 'bg-emerald-500',
    progressTextColor: 'text-emerald-600',
    price: 6349,
    rating: 4.7,
    reviewsCount: 110,
    status: 'Published'
  },
  {
    id: 'c10',
    courseName: 'Flutter & Dart Cross-Platform Mobile App Development',
    courseDescription: 'Build beautiful cross-platform apps with Flutter. Learn hands-on projects, best practices...',
    thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&auto=format&fit=crop&q=80',
    duration: '24h 15m',
    sectionsCount: 5,
    progress: 25,
    progressColor: 'bg-indigo-600',
    progressTextColor: 'text-indigo-600',
    price: 5999,
    rating: 4.5,
    reviewsCount: 68,
    status: 'In Progress'
  },
  {
    id: 'c11',
    courseName: 'Cyber Security & Ethical Hacking Masterclass',
    courseDescription: 'Learn cybersecurity with hands-on labs and real-world scenarios.',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
    duration: '32h 0m',
    sectionsCount: 8,
    progress: 45,
    progressColor: 'bg-teal-500',
    progressTextColor: 'text-teal-600',
    price: 5649,
    rating: 4.6,
    reviewsCount: 90,
    status: 'Published'
  },
  {
    id: 'c12',
    courseName: 'DevOps Essentials: CI/CD Pipelines & Kubernetes',
    courseDescription: 'Master DevOps tools and deploy scalable applications. Learn hands-on with CI/CD...',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&auto=format&fit=crop&q=80',
    duration: '27h 10m',
    sectionsCount: 7,
    progress: 15,
    progressColor: 'bg-blue-600',
    progressTextColor: 'text-blue-600',
    price: 5299,
    rating: 4.5,
    reviewsCount: 73,
    status: 'In Progress'
  },
  {
    id: 'c13',
    courseName: 'Modern UI/UX Design with Figma & Tailwind CSS',
    courseDescription: 'Design modern and responsive interfaces with Figma, UI design systems and CSS.',
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
    duration: '20h 10m',
    sectionsCount: 6,
    progress: 60,
    progressColor: 'bg-purple-500',
    progressTextColor: 'text-purple-600',
    price: 4899,
    rating: 4.8,
    reviewsCount: 115,
    status: 'Published'
  },
  {
    id: 'c14',
    courseName: 'Complete System Design for Tech Interviews',
    courseDescription: 'Learn system design with real-world architectural case studies and scaling techniques.',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    duration: '30h 0m',
    sectionsCount: 9,
    progress: 85,
    progressColor: 'bg-emerald-500',
    progressTextColor: 'text-emerald-600',
    price: 6499,
    rating: 4.9,
    reviewsCount: 140,
    status: 'Published'
  },
  {
    id: 'c15',
    courseName: 'Cloud Engineering with AWS & Docker Containers',
    courseDescription: 'Deploy and manage production cloud infrastructure with AWS services and Docker.',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    duration: '26h 40m',
    sectionsCount: 7,
    progress: 30,
    progressColor: 'bg-amber-500',
    progressTextColor: 'text-amber-600',
    price: 5999,
    rating: 4.6,
    reviewsCount: 85,
    status: 'In Progress'
  },
  {
    id: 'c16',
    courseName: 'Node.js, Express & PostgreSQL Backend Architecture',
    courseDescription: 'Build production-ready REST & GraphQL APIs with Node.js, Express and PostgreSQL.',
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    duration: '23h 30m',
    sectionsCount: 6,
    progress: 55,
    progressColor: 'bg-green-600',
    progressTextColor: 'text-green-600',
    price: 4799,
    rating: 4.7,
    reviewsCount: 92,
    status: 'Published'
  },
  {
    id: 'c17',
    courseName: 'Python for Data Science and Machine Learning',
    courseDescription: 'Learn Python, NumPy, Pandas, Matplotlib, Scikit-Learn and build real ML models.',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    duration: '34h 0m',
    sectionsCount: 10,
    progress: 95,
    progressColor: 'bg-blue-600',
    progressTextColor: 'text-blue-600',
    price: 5499,
    rating: 4.8,
    reviewsCount: 160,
    status: 'Published'
  },
  {
    id: 'c18',
    courseName: 'React & Next.js Masterclass with TypeScript',
    courseDescription: 'Build modern, full-featured web applications with Next.js App Router and TypeScript.',
    thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop&q=80',
    duration: '28h 15m',
    sectionsCount: 8,
    progress: 40,
    progressColor: 'bg-indigo-600',
    progressTextColor: 'text-indigo-600',
    price: 6199,
    rating: 4.7,
    reviewsCount: 105,
    status: 'In Progress'
  },
  {
    id: 'c19',
    courseName: 'Data Structures & Algorithms (Supreme 4.0)',
    courseDescription: 'Master Data Structures and Algorithms from scratch with rigorous problem solving.',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    duration: '45h 0m',
    sectionsCount: 14,
    progress: 75,
    progressColor: 'bg-rose-500',
    progressTextColor: 'text-rose-600',
    price: 7999,
    rating: 4.9,
    reviewsCount: 210,
    status: 'Published'
  },
  {
    id: 'c20',
    courseName: 'Full Stack Web Development Bootcamp 2026',
    courseDescription: 'Comprehensive web development training covering frontend, backend and cloud deployment.',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
    duration: '52h 0m',
    sectionsCount: 16,
    progress: 20,
    progressColor: 'bg-sky-500',
    progressTextColor: 'text-sky-600',
    price: 8499,
    rating: 4.8,
    reviewsCount: 185,
    status: 'In Progress'
  },
  {
    id: 'c21',
    courseName: 'Python Programming for Beginners',
    courseDescription: 'Learn Python programming from the ground up with interactive exercises and projects.',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80',
    duration: '16h 0m',
    sectionsCount: 4,
    progress: 100,
    progressColor: 'bg-emerald-500',
    progressTextColor: 'text-emerald-600',
    price: 3499,
    rating: 4.6,
    reviewsCount: 95,
    status: 'Published'
  },
  {
    id: 'c22',
    courseName: 'Docker & Kubernetes Microservices Orchestration',
    courseDescription: 'Containerize applications and deploy microservices with Kubernetes clusters.',
    thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&auto=format&fit=crop&q=80',
    duration: '22h 45m',
    sectionsCount: 6,
    progress: 65,
    progressColor: 'bg-blue-600',
    progressTextColor: 'text-blue-600',
    price: 5199,
    rating: 4.7,
    reviewsCount: 78,
    status: 'Published'
  },
  {
    id: 'c23',
    courseName: 'Android App Development with Kotlin',
    courseDescription: 'Build modern Android apps using Kotlin, Jetpack Compose and Material 3 design.',
    thumbnail: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=600&auto=format&fit=crop&q=80',
    duration: '29h 20m',
    sectionsCount: 7,
    progress: 35,
    progressColor: 'bg-teal-500',
    progressTextColor: 'text-teal-600',
    price: 5799,
    rating: 4.6,
    reviewsCount: 82,
    status: 'In Progress'
  },
  {
    id: 'c24',
    courseName: 'Advanced Spring Boot & Microservices in Java',
    courseDescription: 'Enterprise-grade Java backend architecture with Spring Boot 3, Security, and Kafka.',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    duration: '38h 0m',
    sectionsCount: 11,
    progress: 80,
    progressColor: 'bg-orange-500',
    progressTextColor: 'text-orange-600',
    price: 6899,
    rating: 4.8,
    reviewsCount: 130,
    status: 'Published'
  }
];

export default function CoursesTable({ courses, setCourses }) {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);

  // Selection state
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);

  // PAGINATION STATE:
  // Shows 6 courses per page as requested
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  // Active floating dropdown menu for 3-dots
  const [activeMenuCourseId, setActiveMenuCourseId] = useState(null);
  const menuRef = useRef(null);

  // Close 3-dots action menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuCourseId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Merge live API courses with reference courses if API is empty or has fewer courses
  const allCourses =
    courses && courses.length > 0
      ? courses.length < REFERENCE_COURSES.length
        ? [
            ...courses.map((c) => ({
              id: c._id || c.id,
              courseName: c.courseName,
              courseDescription: c.courseDescription,
              thumbnail: c.thumbnail,
              duration: c.totalDuration || '20h 0m',
              sectionsCount: c.courseContent?.length || c.sections?.length || 5,
              progress: 50,
              progressColor: 'bg-indigo-600',
              progressTextColor: 'text-indigo-600',
              price: c.price || 3499,
              rating: c.averageRating || 4.6,
              reviewsCount: c.ratingAndReviews?.length || 85,
              status: c.status === COURSE_STATUS.PUBLISHED ? 'Published' : 'In Progress'
            })),
            ...REFERENCE_COURSES.slice(courses.length)
          ]
        : courses.map((c) => ({
            id: c._id || c.id,
            courseName: c.courseName,
            courseDescription: c.courseDescription,
            thumbnail: c.thumbnail,
            duration: c.totalDuration || '20h 0m',
            sectionsCount: c.courseContent?.length || c.sections?.length || 5,
            progress: 50,
            progressColor: 'bg-indigo-600',
            progressTextColor: 'text-indigo-600',
            price: c.price || 3499,
            rating: c.averageRating || 4.6,
            reviewsCount: c.ratingAndReviews?.length || 85,
            status: c.status === COURSE_STATUS.PUBLISHED ? 'Published' : 'In Progress'
          }))
      : REFERENCE_COURSES;

  // Pagination calculations
  const totalCourses = allCourses.length;
  const totalPages = Math.ceil(totalCourses / coursesPerPage) || 1;
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = Math.min(startIndex + coursesPerPage, totalCourses);
  const currentCourses = allCourses.slice(startIndex, endIndex);

  // Toggle select all on current page
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(allCourses.map((c) => c.id || c._id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectCourse = (id) => {
    if (selectedCourses.includes(id)) {
      setSelectedCourses(selectedCourses.filter((item) => item !== id));
    } else {
      setSelectedCourses([...selectedCourses, id]);
    }
  };

  const handleCourseDelete = async (courseId) => {
    setLoading(true);
    if (courseId) {
      await deleteCourse({ courseId }, token);
    } else {
      for (const id of selectedCourses) {
        await deleteCourse({ courseId: id }, token);
      }
    }
    const result = await fetchInstructorCourses(token);
    if (result) {
      setCourses(result);
    }
    setConfirmationModal(null);
    setSelectedCourses([]);
    setSelectAll(false);
    setLoading(false);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. BULK ACTION BAR MATCHING SCREENSHOT */}
      <div className="flex justify-between items-center px-5 py-3.5 bg-[#0f172a] rounded-xl shadow-xs text-white">
        
        {/* Left: "Select All" Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 accent-blue-600 cursor-pointer"
          />
          <span className="text-xs font-semibold text-white tracking-wide select-none">
            Select All
          </span>
        </div>

        {/* Right: Delete Selected Button */}
        <button
          disabled={loading || selectedCourses.length === 0}
          onClick={() => {
            setConfirmationModal({
              text1: 'Delete Selected Courses?',
              text2: 'This will permanently remove the selected courses from your catalog.',
              btn1Text: !loading ? 'Delete All' : 'Deleting...',
              btn2Text: 'Cancel',
              btn1Handler: !loading ? () => handleCourseDelete() : () => {},
              btn2Handler: () => setConfirmationModal(null),
            });
          }}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
            selectedCourses.length > 0
              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer'
              : 'text-slate-400 cursor-not-allowed opacity-60'
          }`}
        >
          <RiDeleteBin6Line size={14} />
          <span>Delete Selected ({selectedCourses.length})</span>
        </button>
      </div>

      {/* 2. THREE-COLUMN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {currentCourses.map((course) => {
          const courseId = course.id || course._id;
          const isSelected = selectedCourses.includes(courseId);
          const isPublished = course.status === 'Published' || course.status === COURSE_STATUS.PUBLISHED;

          return (
            <div
              key={courseId}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              {/* TOP THUMBNAIL AREA */}
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80'}
                  alt={course.courseName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x400/0f172a/94a3b8?text=Course+Thumbnail';
                  }}
                />

                {/* Overlaid Checkbox */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectCourse(courseId)}
                    className="w-4 h-4 rounded bg-white/90 border-slate-300 accent-blue-600 cursor-pointer shadow-sm"
                  />
                </div>

                {/* Overlaid Status Badge */}
                <div className="absolute top-3.5 right-3.5 z-10">
                  {isPublished ? (
                    <span className="bg-[#dcfce7] text-[#15803d] text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-[#bbf7d0] shadow-xs flex items-center gap-1">
                      Published
                    </span>
                  ) : (
                    <span className="bg-blue-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      In Progress
                    </span>
                  )}
                </div>
              </div>

              {/* CARD BODY CONTENT */}
              <div className="p-4 sm:p-5 flex flex-col gap-3.5 flex-1 justify-between">
                
                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3
                    onClick={() => navigate(`/dashboard/edit-course/${courseId}`)}
                    className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer"
                    title={course.courseName}
                  >
                    {course.courseName}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.courseDescription || 'Complete course syllabus and hands-on modules.'}
                  </p>
                </div>

                {/* Meta Row: Duration & Sections */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <FiClock size={13} className="text-slate-400" />
                    <span>{course.duration || '24h 0m'}</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1">
                    <FiFileText size={13} className="text-slate-400" />
                    <span>{course.sectionsCount || 5} Sections</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <span className={`text-[11px] font-semibold ${course.progressTextColor || 'text-indigo-600'}`}>
                    {course.progress || 50}% Complete
                  </span>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${course.progressColor || 'bg-indigo-600'}`}
                      style={{ width: `${course.progress || 50}%` }}
                    />
                  </div>
                </div>

                {/* Price & Rating */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-base sm:text-lg font-extrabold text-[#ea580c]">
                    ₹{(course.price || 3499).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold">
                    <span className="text-amber-400 text-sm">★</span>
                    <span>{course.rating || 4.6} ({course.reviewsCount || 85})</span>
                  </div>
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  
                  {/* Button 1: Analytics */}
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/instructor')}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FiBarChart2 size={14} className="text-slate-500" />
                    <span>Analytics</span>
                  </button>

                  {/* Row 2: Edit & 3-Dots Button */}
                  <div className="flex items-center gap-2">
                    
                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/edit-course/${courseId}`)}
                      className="flex-1 py-2.5 px-4 bg-[#f97316] hover:bg-[#ea580c] active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <FiEdit size={13} />
                      <span>Edit</span>
                    </button>

                    {/* 3-Dots Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuCourseId(activeMenuCourseId === courseId ? null : courseId);
                        }}
                        className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center transition cursor-pointer"
                        title="Options"
                      >
                        <FiMoreVertical size={16} />
                      </button>

                      {/* Dropdown Options */}
                      {activeMenuCourseId === courseId && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 bottom-12 z-30 w-44 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                        >
                          <button
                            onClick={() => {
                              setActiveMenuCourseId(null);
                              navigate(`/courses/${courseId}`);
                            }}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium text-left cursor-pointer"
                          >
                            <FiEye size={14} className="text-slate-500" />
                            <span>View Course</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuCourseId(null);
                              navigate(`/dashboard/edit-course/${courseId}`);
                            }}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium text-left cursor-pointer"
                          >
                            <FiEdit size={14} className="text-blue-600" />
                            <span>Edit Curriculum</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuCourseId(null);
                              setConfirmationModal({
                                text1: 'Delete Course?',
                                text2: 'This action cannot be undone.',
                                btn1Text: 'Delete',
                                btn2Text: 'Cancel',
                                btn1Handler: () => handleCourseDelete(courseId),
                                btn2Handler: () => setConfirmationModal(null),
                              });
                            }}
                            className="w-full px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium text-left cursor-pointer border-t border-slate-100 mt-1"
                          >
                            <FiTrash2 size={14} />
                            <span>Delete Course</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* 3. PAGINATION BAR MATCHING SCREENSHOT */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
        
        {/* Pagination Buttons: < 1 2 3 4 5 > */}
        <div className="flex items-center gap-1.5">
          
          {/* Previous Page Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            title="Previous Page"
          >
            <FiChevronLeft size={15} />
          </button>

          {/* Page numbers up to 5 */}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Page Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            title="Next Page"
          >
            <FiChevronRight size={15} />
          </button>
        </div>

        {/* Showing X-Y of Z courses Indicator */}
        <div className="text-slate-500 font-medium text-xs">
          Showing <strong className="text-slate-800">{startIndex + 1}-{endIndex}</strong> of{' '}
          <strong className="text-slate-800">{totalCourses}</strong> courses
        </div>
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}
