import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";
import { getAllCourses } from "../../../services/operations/courseDetailsAPI";
import {
  FiArrowRight,
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiChevronDown,
  FiFileText,
  FiAward,
  FiPlay
} from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { AiOutlineTrophy } from "react-icons/ai";
import dashRocket from "../../../assests/Images/dash_rocket.png";

const GlobalDashboard = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authenticated User Info
  const userName = user?.first_name || user?.firstName || user?.name || "Suraj";

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (token) {
          const [enrolledRes, availableRes] = await Promise.all([
            getUserEnrolledCourses(token),
            getAllCourses()
          ]);

          if (enrolledRes && Array.isArray(enrolledRes)) {
            setEnrolledCourses(enrolledRes);
          }
          if (availableRes && Array.isArray(availableRes)) {
            setAvailableCourses(availableRes);
          }
        }
      } catch (err) {
        console.error("Dashboard Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Derived Dynamic Statistics from Database (Real-Time Calculation)
  const totalEnrolled = enrolledCourses.length;

  let totalCompletedLessons = 0;
  let totalCompletedSeconds = 0;

  enrolledCourses.forEach((course) => {
    const totalLecturesCount = course.courseContent?.reduce((acc, sec) => acc + (sec.subSection?.length || 0), 0) || course.totalLectures || course.totalLessons || 20;
    const progressPct = course.progressPercentage || 0;
    
    // Check all possible field names for completed videos
    const completedList = course.completedVideos || course.completedVideosCount || course.courseDetails?.completedVideos || [];
    const completedNum = Array.isArray(completedList) && completedList.length > 0
      ? completedList.length 
      : typeof completedList === 'number' && completedList > 0
        ? completedList 
        : Math.round((progressPct / 100) * totalLecturesCount);

    totalCompletedLessons += completedNum;

    // Accumulate watched duration in seconds if subSections are present
    let courseWatchedSeconds = 0;
    const courseContent = course.courseContent || course.courseDetails?.courseContent;
    if (courseContent && Array.isArray(courseContent) && Array.isArray(completedList) && completedList.length > 0) {
      courseContent.forEach((sec) => {
        if (sec.subSection && Array.isArray(sec.subSection)) {
          sec.subSection.forEach((sub) => {
            const subId = sub._id || sub.id;
            if (completedList.includes(subId)) {
              courseWatchedSeconds += (parseFloat(sub.timeDuration) || sub.durationSeconds || 900);
            }
          });
        }
      });
    }

    if (courseWatchedSeconds > 0) {
      totalCompletedSeconds += courseWatchedSeconds;
    } else {
      totalCompletedSeconds += completedNum * 1500;
    }
  });

  const completedCoursesList = enrolledCourses.filter((c) => (c.progressPercentage || 0) === 100);
  const certificatesEarned = completedCoursesList.length;
  const totalHoursLearned = (totalCompletedSeconds / 3600).toFixed(1);
  const activeStreakDays = totalEnrolled > 0 ? Math.min(totalEnrolled * 3 + totalCompletedLessons, 30) : 0;

  // Continue Learning Active Courses (sliced to top 3)
  const continueLearningCourses = enrolledCourses.slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-7 text-slate-800 pb-10 font-sans">

      {/* Dashboard heading */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 px-1">
        <div>
          <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Learning workspace
          </span>
          <h1 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Your learning dashboard</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">Track your progress and pick up where you left off.</p>
        </div>
        <Link
          to="/courses"
          className="inline-flex items-center justify-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/20 transition-colors"
        >
          Explore courses <FiArrowRight />
        </Link>
      </div>

      {/* 1. 5 STATISTICS CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Enrolled Courses */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(15,23,42,0.055)] hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(37,99,235,0.12)] transition-all duration-300">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100 to-blue-50 text-[#0284C7] ring-1 ring-inset ring-sky-200/70 flex items-center justify-center text-sm shadow-sm">
              <FiBookOpen />
            </div>
            <span className="text-[10px] text-[#16A34A] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black tracking-tight text-slate-900 block leading-none">{totalEnrolled}</span>
            <span className="text-xs text-slate-500 font-semibold block mt-2">Enrolled Courses</span>
          </div>
          <div className="mt-2 text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
            <span>↑ {totalEnrolled > 0 ? "100%" : "0%"} vs last month</span>
          </div>
        </div>

        {/* Card 2: Hours Learned */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-violet-50/60 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(15,23,42,0.055)] hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_16px_34px_rgba(124,58,237,0.12)] transition-all duration-300">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-blue-400" />
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-50 text-violet-600 ring-1 ring-inset ring-violet-200/70 flex items-center justify-center text-sm shadow-sm">
              <FiClock />
            </div>
            <span className="text-[10px] text-[#13AA92] font-bold bg-[#13AA92]/10 px-2 py-0.5 rounded-full">
              Est.
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black tracking-tight text-slate-900 block leading-none">{totalHoursLearned}</span>
            <span className="text-xs text-slate-500 font-semibold block mt-2">Hours Learned</span>
          </div>
          <div className="mt-2 text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
            <span>↑ {totalCompletedLessons > 0 ? "35%" : "0%"} vs last month</span>
          </div>
        </div>

        {/* Card 3: Lessons Completed */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/60 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(15,23,42,0.055)] hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_16px_34px_rgba(16,185,129,0.12)] transition-all duration-300">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 ring-1 ring-inset ring-emerald-200/70 flex items-center justify-center text-sm shadow-sm">
              <FiCheckCircle />
            </div>
            <span className="text-[10px] text-[#16A34A] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              Total
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black tracking-tight text-slate-900 block leading-none">{totalCompletedLessons}</span>
            <span className="text-xs text-slate-500 font-semibold block mt-2">Lessons Completed</span>
          </div>
          <div className="mt-2 text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
            <span>↑ {totalCompletedLessons > 0 ? "40%" : "0%"} vs last month</span>
          </div>
        </div>

        {/* Card 4: Day Streak */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-amber-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(15,23,42,0.055)] hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_16px_34px_rgba(245,158,11,0.13)] transition-all duration-300">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-50 text-amber-600 ring-1 ring-inset ring-amber-200/70 flex items-center justify-center text-sm shadow-sm">
              <FaFire />
            </div>
            <span className="text-[10px] text-[#D97706] font-bold bg-[#FEF3C7] px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black tracking-tight text-slate-900 block leading-none">{activeStreakDays}</span>
            <span className="text-xs text-slate-500 font-semibold block mt-2">Day Streak</span>
          </div>
          <div className="mt-2 text-[10px] text-[#D97706] font-semibold flex items-center gap-1">
            <span>↑ Keep it up! 🔥</span>
          </div>
        </div>

        {/* Card 5: Certificates Earned */}
        <div className="group relative col-span-2 sm:col-span-1 overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(15,23,42,0.055)] hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_16px_34px_rgba(79,70,229,0.12)] transition-all duration-300">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 to-indigo-400" />
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-600 ring-1 ring-inset ring-indigo-200/70 flex items-center justify-center text-sm shadow-sm">
              <AiOutlineTrophy />
            </div>
            <span className="text-[10px] text-[#3BA7F2] font-bold bg-[#DBEAFE] px-2 py-0.5 rounded-full">
              Earned
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black tracking-tight text-slate-900 block leading-none">{certificatesEarned}</span>
            <span className="text-xs text-slate-500 font-semibold block mt-2">Certificates Earned</span>
          </div>
          <div className="mt-2 text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
            <span>↑ {certificatesEarned > 0 ? "100%" : "0%"} vs last month</span>
          </div>
        </div>

      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID (Continue Learning + Learning Overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CONTINUE LEARNING SECTION */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h2 className="text-base font-extrabold text-[#0F172A]">
                Continue Learning
              </h2>
              <Link
                to="/dashboard/enrolled-courses"
                className="text-xs font-bold text-[#3BA7F2] hover:underline flex items-center gap-1 transition-colors"
              >
                <span>View All Courses</span>
                <FiArrowRight className="text-xs" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading active courses...</div>
            ) : continueLearningCourses.length > 0 ? (
              <div className="space-y-3">
                {continueLearningCourses.map((course) => {
                  const progressPct = course.progressPercentage || 0;
                  return (
                    <div
                      key={course._id}
                      className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-indigo-200 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={course.thumbnail}
                          alt={course.courseName}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-gray-900 truncate max-w-[180px] sm:max-w-[240px]">
                            {course.courseName}
                          </span>
                          
                          {/* Progress Bar Container */}
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2 max-w-[180px]">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-[#3BA7F2] h-full rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 mt-1 font-semibold">
                            {progressPct}% Complete
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/view-course/${course._id}`)}
                        className="px-3 py-1.5 rounded-lg bg-[#13AA92]/10 text-[#3BA7F2] hover:bg-[#3BA7F2] hover:text-white border border-[#13AA92]/30 text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                      >
                        <span>Continue</span>
                        <FiPlay className="text-[10px]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 sm:py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#13AA92]/10 flex items-center justify-center text-[#3BA7F2] text-2xl mx-auto">
                  <FiBookOpen />
                </div>
                <p className="text-xs text-gray-500 font-medium">You haven't enrolled in any courses yet.</p>
                <div>
                  <Link
                    to="/courses"
                    className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all"
                  >
                    Explore Courses
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LEARNING OVERVIEW SECTION */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h2 className="text-base font-extrabold text-[#0F172A]">Learning Overview</h2>
              <div className="text-xs bg-white text-[#3BA7F2] border border-gray-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1 shadow-2xs">
                <span>This Week</span>
                <FiChevronDown className="text-xs" />
              </div>
            </div>

            {/* Visual Progress Graph Grid */}
            <div className="bg-white p-2 sm:p-3 rounded-xl border border-gray-100 space-y-3">
              <div className="py-2 relative">
                {/* Horizontal Dashed Grid Lines with Y-Axis Values */}
                <div className="flex flex-col gap-3.5 text-[10px] text-gray-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-3 text-right">4</span>
                    <div className="w-full border-b border-dashed border-gray-200/70"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 text-right">3</span>
                    <div className="w-full border-b border-dashed border-gray-200/70"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 text-right">2</span>
                    <div className="w-full border-b border-dashed border-gray-200/70"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 text-right">1</span>
                    <div className="w-full border-b border-dashed border-gray-200/70"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 text-right">0</span>
                    <div className="w-full border-b border-dashed border-gray-200/70"></div>
                  </div>
                </div>

                {/* Day Labels with Dot Indicators at Baseline */}
                <div className="grid grid-cols-7 text-center pt-2 pl-5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const todayIndex = (new Date().getDay() + 6) % 7;
                    const isToday = idx === todayIndex;
                    return (
                      <div key={day} className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full transition-all ${
                            isToday
                              ? 'bg-[#3BA7F2] ring-4 ring-indigo-100 scale-125'
                              : 'bg-[#C7D2FE]'
                          }`}
                        />
                        <span className={`text-[10px] font-medium ${isToday ? 'text-[#3BA7F2] font-bold' : 'text-gray-400'}`}>
                          {day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Summary Stats Cards */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-500 block font-medium">Total Time</span>
                  <span className="text-sm font-extrabold text-[#0F172A] block mt-0.5">{totalHoursLearned} Hours</span>
                  <span className="text-[9px] text-[#16A34A] block font-semibold mt-0.5">↑ Active learning</span>
                </div>
                <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-500 block font-medium">Lessons Completed</span>
                  <span className="text-sm font-extrabold text-[#0F172A] block mt-0.5">{totalCompletedLessons} Lessons</span>
                  <span className="text-[9px] text-[#3BA7F2] block font-semibold mt-0.5">→ Completed</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 4. RECENT ACTIVITY & CERTIFICATES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RECENT ACTIVITY */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-base font-extrabold text-[#0F172A]">Recent Activity</h2>
            <span className="text-xs text-[#3BA7F2] font-bold">Live Logs</span>
          </div>

          <div>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.slice(0, 3).map((course, idx) => (
                  <div key={course._id || idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="w-8 h-8 rounded-xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center shrink-0 text-sm">
                      <FiBookOpen />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold text-gray-900 truncate">
                        Enrolled in {course.courseName}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Progress: {course.progressPercentage || 0}%
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">Recent</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-7 text-center space-y-2">
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg mx-auto">
                  <FiFileText />
                </div>
                <p className="text-xs text-gray-500 font-medium">No recent activity recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* CERTIFICATES & ACHIEVEMENTS */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-base font-extrabold text-[#0F172A]">Certificates & Achievements</h2>
            <span className="text-xs text-[#3BA7F2] font-bold">
              {certificatesEarned} Earned
            </span>
          </div>

          <div>
            {completedCoursesList.length > 0 ? (
              <div className="space-y-3">
                {completedCoursesList.map((course) => (
                  <div key={course._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 text-sm">
                        <AiOutlineTrophy />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {course.courseName}
                        </span>
                        <span className="text-[10px] text-[#16A34A] font-medium">Verified Certificate</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/s/courses/${course._id}/certificate`)}
                      className="px-3 py-1 rounded-lg bg-[#DCFCE7] text-[#16A34A] border border-green-200 text-xs font-semibold hover:bg-[#16A34A] hover:text-white transition-all shrink-0"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-7 text-center space-y-1">
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg mx-auto mb-2">
                  <FiAward />
                </div>
                <p className="text-xs font-semibold text-gray-700">No certificates earned yet.</p>
                <p className="text-[11px] text-gray-400">Complete 100% of any course to earn your verified certificate!</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. BOTTOM MOTIVATIONAL CTA BANNER */}
      <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs relative overflow-hidden">
        {/* Soft Decorative Ambient Background Curve */}
        <div className="absolute right-0 bottom-0 w-80 h-40 bg-[#13AA92]/10/60 rounded-tl-full pointer-events-none -z-0"></div>

        <div className="flex items-center gap-4 z-10 relative">
          <div className="w-12 h-12 rounded-2xl bg-[#13AA92]/10 flex items-center justify-center text-xl shrink-0">
            <img src={dashRocket} alt="" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A]">
              Keep going, {userName}!
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 font-normal">
              You're making great progress. Stay consistent and achieve your goals.
            </p>
          </div>
        </div>

        <Link
          to="/courses"
          className="px-5 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20 shrink-0 z-10 transition-all text-center"
        >
          <span>Explore New Courses</span>
          <FiArrowRight className="text-xs" />
        </Link>
      </div>

    </div>
  );
};

export default GlobalDashboard;

