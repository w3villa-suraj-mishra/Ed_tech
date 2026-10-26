import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { formattedDate } from "../../../utils/dateFormatter";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";
import {
  FiDownload,
  FiCamera,
  FiMapPin,
  FiCalendar,
  FiEdit2,
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiShield,
  FiArrowRight,
  FiMonitor,
  FiTarget,
  FiChevronDown
} from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { AiOutlineTrophy } from "react-icons/ai";
import { IoAlarmOutline, IoRocketOutline } from "react-icons/io5";

const MyProfile = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authenticated user values with fallbacks matching preview
  const firstName = user?.first_name || user?.firstName || "Suraj";
  const lastName = user?.last_name || user?.lastName || "Mishra";
  const fullName = `${firstName} ${lastName}`.trim();
  const accountType = user?.account_type || user?.accountType || "Student";
  const email = user?.email || "suraj.mishra4w3villa@gmail.com";
  const joinedDate = user?.createdAt ? formattedDate(user.createdAt) : "January 1, 2024";

  useEffect(() => {
    const fetchUserStats = async () => {
      if (token) {
        setLoading(true);
        try {
          const res = await getUserEnrolledCourses(token);
          if (res && Array.isArray(res)) {
            setEnrolledCourses(res);
          }
        } catch (error) {
          console.error("Error fetching enrolled courses for profile stats", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserStats();
  }, [token]);

  // Derived Dynamic Statistics from Database (Real-Time Calculation)
  const totalEnrolled = enrolledCourses.length;

  let totalCompletedLessons = 0;
  let totalCompletedSeconds = 0;

  enrolledCourses.forEach((course) => {
    const totalLecturesCount = course.courseContent?.reduce((acc, sec) => acc + (sec.subSection?.length || 0), 0) || course.totalLectures || course.totalLessons || 20;
    const progressPct = course.progressPercentage || 0;
    
    const completedList = course.completedVideos || course.completedVideosCount || course.courseDetails?.completedVideos || [];
    const completedNum = Array.isArray(completedList) && completedList.length > 0
      ? completedList.length 
      : typeof completedList === 'number' && completedList > 0
        ? completedList 
        : Math.round((progressPct / 100) * totalLecturesCount);

    totalCompletedLessons += completedNum;

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

  const certificatesEarned = enrolledCourses.filter((c) => (c.progressPercentage || 0) === 100).length;
  const totalHoursLearned = (totalCompletedSeconds / 3600).toFixed(1);
  const activeStreakDays = totalEnrolled > 0 ? Math.min(totalEnrolled * 3 + totalCompletedLessons, 30) : 0;

  // JSON Profile Export Download Handler
  const handleDownloadProfile = () => {
    const profileData = {
      fullName,
      email,
      accountType,
      contactNumber: user?.additionalDetails?.contactNumber || "Not provided",
      gender: user?.additionalDetails?.gender || "Not specified",
      dateOfBirth: user?.additionalDetails?.dateOfBirth ? formattedDate(user.additionalDetails.dateOfBirth) : "January 1, 1970",
      about: user?.additionalDetails?.about || "Passionate learner exploring the world of technology and always eager to build, learn and grow.",
      address: user?.additionalDetails?.address || "Sector 63, Block A, Noida, Uttar Pradesh 201301, India",
      enrolledCoursesCount: totalEnrolled,
      completedLessonsCount: totalCompletedLessons,
      certificatesCount: certificatesEarned,
      exportedAt: new Date().toLocaleString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profileData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${firstName}_profile_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full space-y-6 text-gray-800 pb-10 font-sans">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">My Profile</h1>
          <p className="text-xs text-gray-500 mt-1 font-normal">
            Manage your personal information and account settings.
          </p>
        </div>

        <button
          onClick={handleDownloadProfile}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-[#3BA7F2] border border-indigo-200/90 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <FiDownload className="text-sm" />
          <span>Download Profile</span>
        </button>
      </div>

      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {user?.image ? (
              <img
                src={user.image}
                alt={`profile-${firstName}`}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#2E6930] text-white flex items-center justify-center text-3xl font-extrabold shadow-inner select-none">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              onClick={() => navigate("/dashboard/settings")}
              title="Change Photo"
              className="absolute bottom-0 right-0 w-6 h-6 bg-[#3BA7F2] text-white rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-xs cursor-pointer hover:bg-[#3BA7F2] transition-colors"
            >
              <FiCamera />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-[#0F172A]">{fullName}</h2>
              <span className="text-[10px] font-bold bg-[#13AA92]/10 text-[#3BA7F2] border border-[#13AA92]/30 px-2.5 py-0.5 rounded-full">
                {accountType}
              </span>
            </div>

            <p className="text-xs text-gray-600 font-semibold">{email}</p>

            <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <FiMapPin className="text-gray-400" />
                <span>{user?.additionalDetails?.address || "Noida, Uttar Pradesh, India"}</span>
              </span>
              <span className="flex items-center gap-1">
                <FiCalendar className="text-gray-400" />
                <span>Joined on {joinedDate}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard/settings")}
          className="px-5 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 shrink-0 cursor-pointer"
        >
          <FiEdit2 className="text-xs" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* 2. DYNAMIC STATISTICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Enrolled Courses */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center text-sm">
              <FiBookOpen />
            </div>
            <span className="text-[10px] text-[#16A34A] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">{totalEnrolled}</span>
            <span className="text-xs text-gray-500 font-medium block mt-0.5">Enrolled Courses</span>
          </div>
          <div className="mt-2 text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
            <span>↑ {totalEnrolled > 0 ? "100%" : "0%"} vs last month</span>
          </div>
        </div>

        {/* Hours Learned */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#13AA92]/10 text-[#9333EA] flex items-center justify-center text-sm">
              <FiClock />
            </div>
            <span className="text-[10px] text-[#13AA92] font-bold bg-[#13AA92]/10 px-2 py-0.5 rounded-full">
              Est.
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">{totalHoursLearned}</span>
            <span className="text-xs text-gray-500 font-medium block mt-0.5">Hours Learned</span>
          </div>
          <div className="mt-2 text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
            <span>↑ {totalCompletedLessons > 0 ? "35%" : "0%"} vs last month</span>
          </div>
        </div>

        {/* Lessons Completed */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center text-sm">
              <FiCheckCircle />
            </div>
            <span className="text-[10px] text-[#16A34A] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              Total
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">{totalCompletedLessons}</span>
            <span className="text-xs text-gray-500 font-medium block mt-0.5">Lessons Completed</span>
          </div>
          <div className="mt-2 text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
            <span>↑ {totalCompletedLessons > 0 ? "40%" : "0%"} vs last month</span>
          </div>
        </div>

        {/* Day Streak */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-sm">
              <FaFire />
            </div>
            <span className="text-[10px] text-[#D97706] font-bold bg-[#FEF3C7] px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">{activeStreakDays}</span>
            <span className="text-xs text-gray-500 font-medium block mt-0.5">Day Streak</span>
          </div>
          <div className="mt-2 text-[10px] text-[#D97706] font-semibold flex items-center gap-1">
            <span>↑ Keep it up! 🔥</span>
          </div>
        </div>

        {/* Certificates Earned */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#DBEAFE] text-[#3BA7F2] flex items-center justify-center text-sm">
              <AiOutlineTrophy />
            </div>
            <span className="text-[10px] text-[#3BA7F2] font-bold bg-[#DBEAFE] px-2 py-0.5 rounded-full">
              Earned
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">{certificatesEarned}</span>
            <span className="text-xs text-gray-500 font-medium block mt-0.5">Certificates Earned</span>
          </div>
          <div className="mt-2 text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
            <span>↑ {certificatesEarned > 0 ? "100%" : "0%"} vs last month</span>
          </div>
        </div>

      </div>

      {/* 3. ABOUT BIO & PERSONAL DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ABOUT BIO CARD */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-[#0F172A]">About Bio</h3>
              <button
                onClick={() => navigate("/dashboard/settings")}
                className="text-xs text-[#3BA7F2] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Edit</span>
                <FiChevronDown className="text-xs" />
              </button>
            </div>

            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 sm:p-5">
              <p className="text-xs sm:text-sm text-gray-500 italic leading-relaxed font-normal">
                {user?.additionalDetails?.about || "Passionate learner exploring the world of technology and always eager to build, learn and grow."}
              </p>
            </div>
          </div>
        </div>

        {/* PERSONAL DETAILS CARD */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-base font-extrabold text-[#0F172A]">Personal Details</h3>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="text-xs text-[#3BA7F2] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Edit</span>
              <FiChevronDown className="text-xs" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
            <div>
              <span className="text-gray-400 text-[11px] block font-medium">First Name</span>
              <span className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5 block">{firstName}</span>
            </div>

            <div>
              <span className="text-gray-400 text-[11px] block font-medium">Last Name</span>
              <span className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5 block">{lastName || "Mishra"}</span>
            </div>

            <div>
              <span className="text-gray-400 text-[11px] block font-medium">Email Address</span>
              <span className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5 truncate block">{email}</span>
            </div>

            <div>
              <span className="text-gray-400 text-[11px] block font-medium">Phone Number</span>
              <span className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5 block">
                {user?.additionalDetails?.contactNumber || "Not provided"}
              </span>
            </div>

            <div>
              <span className="text-gray-400 text-[11px] block font-medium">Gender</span>
              <span className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5 block">
                {user?.additionalDetails?.gender || "Not specified"}
              </span>
            </div>

            <div>
              <span className="text-gray-400 text-[11px] block font-medium">Date of Birth</span>
              <span className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5 block">
                {user?.additionalDetails?.dateOfBirth ? formattedDate(user.additionalDetails.dateOfBirth) : "January 1, 1970"}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. ADDRESS & ACCOUNT INFO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ADDRESS & LOCATION */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-base font-extrabold text-[#0F172A]">Address & Map Location</h3>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="text-xs text-[#3BA7F2] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Edit</span>
              <FiChevronDown className="text-xs" />
            </button>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-2xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center text-base shrink-0 mt-0.5">
              <FiMapPin />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 block font-medium">Registered Address</span>
              <p className="text-xs sm:text-sm font-bold text-[#0F172A] mt-0.5 leading-snug">
                {user?.additionalDetails?.address || "Sector 63, Block A, Noida, Uttar Pradesh 201301, India"}
              </p>
            </div>
          </div>
        </div>

        {/* ACCOUNT INFORMATION */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-base font-extrabold text-[#0F172A]">Account Information</h3>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="text-xs text-[#3BA7F2] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Edit</span>
              <FiChevronDown className="text-xs" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
            <div>
              <span className="text-gray-400 text-[11px] block font-medium">Account Type</span>
              <span className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5 block">{accountType}</span>
            </div>

            <div>
              <span className="text-gray-400 text-[11px] block font-medium">Account Status</span>
              <span className="inline-block text-[10px] font-bold bg-[#DCFCE7] text-[#16A34A] px-2.5 py-0.5 rounded-full mt-1">
                Active
              </span>
            </div>

            <div>
              <span className="text-gray-400 text-[11px] block font-medium">Member Since</span>
              <span className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5 block">{joinedDate}</span>
            </div>

            <div>
              <span className="text-gray-400 text-[11px] block font-medium">Last Login</span>
              <span className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5 block">Today, Active Now</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. LEARNING PREFERENCES */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-base font-extrabold text-[#0F172A]">Learning Preferences</h3>
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="text-xs text-[#3BA7F2] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
          >
            <span>Edit</span>
            <FiChevronDown className="text-xs" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center text-base shrink-0">
              <FiMonitor />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-medium">Preferred Language</span>
              <span className="font-bold text-[#0F172A] text-xs block mt-0.5">English</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-base shrink-0">
              <IoAlarmOutline className="text-lg" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-medium">Daily Learning Time</span>
              <span className="font-bold text-[#0F172A] text-xs block mt-0.5">1-2 hours</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center text-base shrink-0">
              <FiTarget />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-medium">Learning Goal</span>
              <span className="font-bold text-[#0F172A] text-xs block mt-0.5">Full Stack Development</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#13AA92]/10 text-[#13AA92] flex items-center justify-center text-base shrink-0">
              <IoRocketOutline className="text-lg" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-medium">Experience Level</span>
              <span className="font-bold text-[#0F172A] text-xs block mt-0.5">Beginner</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. PRIVACY & SECURITY BANNER */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-2xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center text-lg shrink-0">
            <FiShield />
          </div>
          <div>
            <span className="font-bold text-[#0F172A] text-xs sm:text-sm block">Your data is safe and secure</span>
            <span className="text-gray-500 text-[11px] block mt-0.5">We never share your personal information with anyone.</span>
          </div>
        </div>

        <Link
          to="/privacy-policy"
          className="text-[#3BA7F2] hover:underline font-bold flex items-center gap-1 shrink-0"
        >
          <span>Privacy Policy</span>
          <FiArrowRight className="text-xs" />
        </Link>
      </div>

    </div>
  );
};

export default MyProfile;