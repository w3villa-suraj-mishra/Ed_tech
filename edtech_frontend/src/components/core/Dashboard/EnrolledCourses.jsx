import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"
import ProgressBar from '@ramonak/react-progress-bar'
import { useNavigate } from "react-router-dom"
import { BsPlayCircleFill } from 'react-icons/bs'
import { FiClock } from 'react-icons/fi'

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [enrolledCourses, setEnrolledCourses] = useState(null)
  
  const getEnrolledCourses = async () => {
    try {
      const res = await getUserEnrolledCourses(token);
      if (res && Array.isArray(res)) {
        const normalized = res.map(item => (item && item.course) ? { ...item.course, ...item } : item);
        setEnrolledCourses(normalized);
      } else {
        setEnrolledCourses([]);
      }
    } catch (error) {
      console.log("Could not fetch enrolled courses.")
    }
  };

  const { cart = [] } = useSelector((state) => state.cart || {});

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get("session_id");
    const rawCourses = query.get("courses");
    const plan = query.get("plan") || "gold";
    const offerId = query.get("offerId") || null;
    let coursesList = [];
    if (rawCourses) {
      try {
        coursesList = JSON.parse(decodeURIComponent(rawCourses));
        if (!Array.isArray(coursesList)) coursesList = [coursesList];
      } catch {
        try {
          coursesList = JSON.parse(rawCourses);
          if (!Array.isArray(coursesList)) coursesList = [coursesList];
        } catch {
          coursesList = rawCourses.split(",").map(c => c.trim()).filter(Boolean);
        }
      }
    }
    if ((!coursesList || coursesList.length === 0) && cart && cart.length > 0) {
      coursesList = cart.map((c) => c._id || c.id).filter(Boolean);
    }
    if (sessionId && token) {
      (async () => {
        const { verifyPayment } = await import("../../../services/operations/studentFeaturesAPI");
        await verifyPayment(sessionId, coursesList, token, navigate, dispatch, plan, offerId);
        getEnrolledCourses();
      })();
    } else if (token) {
      getEnrolledCourses();
    }
  }, [token])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Learning</h1>
          <p className="text-richblack-300">Continue where you left off and keep up the progress.</p>
        </div>
      </div>

      {!enrolledCourses ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !enrolledCourses.length ? (
        <div className="bg-richblack-800 rounded-2xl p-12 text-center border border-richblack-700">
          <p className="text-richblack-200 text-lg mb-6">You haven't enrolled in any courses yet.</p>
          <button 
            onClick={() => navigate('/catalog')}
            className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-all"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map((course, i) => (
            <div 
              key={i}
              className="bg-richblack-800 rounded-2xl overflow-hidden border border-richblack-700 hover:border-richblack-500 transition-all group flex flex-col"
            >
              {/* IMAGE / THUMBNAIL */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.courseName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <BsPlayCircleFill size={50} className="text-yellow-400" />
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white line-clamp-1">{course.courseName}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    course.plan === 'gold' 
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : course.plan === 'silver'
                        ? course.isExpired || course.status === 'expired'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                  }`}>
                    {course.plan || 'Free'}
                  </span>
                </div>
                <div className="text-xs text-richblack-400 mb-3 space-y-0.5">
                  <p>Access: <strong className="text-white capitalize">{course.plan === 'gold' ? 'Unlimited' : course.plan === 'silver' ? 'Full Course (1 Year)' : '2 Videos Only'}</strong></p>
                  {course.plan === 'silver' && course.expiresAt && (
                    <p className={course.isExpired || course.status === 'expired' ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                      {course.isExpired || course.status === 'expired' ? 'Expired On: ' : 'Expires On: '}
                      {new Date(course.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <p className="text-sm text-richblack-300 mb-6 line-clamp-2 leading-relaxed">
                  {course.courseDescription}
                </p>

                {/* PROGRESS */}
                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2 text-richblack-200">
                      <FiClock />
                      <span>{course?.totalDuration || '0m'}</span>
                    </div>
                    <span className="text-yellow-400">{course.progressPercentage || 0}% Complete</span>
                  </div>
                  
                  <div className="relative">
                     <ProgressBar
                      completed={course.progressPercentage || 0}
                      height="6px"
                      isLabelVisible={false}
                      baseBgColor="#2C333F"
                      bgColor="#FFD60A"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        const courseId = course._id || course.id;
                        navigate(`/s/courses/${courseId}/take`);
                      }}
                      className="w-full py-3 rounded-xl bg-richblack-700 text-white font-bold text-sm group-hover:bg-yellow-400 group-hover:text-black transition-all"
                    >
                      {course.progressPercentage > 0 ? "Continue Course" : "Start Course"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}