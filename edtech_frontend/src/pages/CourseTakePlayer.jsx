import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnector";
import { courseEndpoints } from "../services/apis";
import {
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
  setCompletedLectures,
  updateCompletedLectures,
} from "../services/slices/viewCourseSlice";
import { markLectureAsComplete, fetchCourseReviews, createRating, postCommentAPI, fetchCourseComments, deleteCommentAPI } from "../services/operations/courseDetailsAPI";
import {
  FiArrowLeft,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiPlayCircle,
  FiLock,
  FiAward,
  FiExternalLink,
  FiTrash2
} from "react-icons/fi";
import { FaComments } from "react-icons/fa6";
import CoursePracticeTab from "../components/core/ViewCourse/CoursePracticeTab";

const { COURSE_DETAILS_API } = courseEndpoints;

const CourseTakePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [currentLecture, setCurrentLecture] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const [showPractice, setShowPractice] = useState(false);

  // Certificate Modal State
  const [showCertModal, setShowCertModal] = useState(false);

  // Dynamic Discussion & Rating State
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentImage, setCommentImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);
  const [userRatingInput, setUserRatingInput] = useState(5);
  const [reviewTextInput, setReviewTextInput] = useState("");

  // Load reviews dynamically from API
  const loadReviews = async () => {
    if (!courseId) return;
    const data = await fetchCourseReviews(courseId);
    setReviewsList(data);

    // If current logged-in user already submitted a review, populate form
    if (user && data.length > 0) {
      const myReview = data.find((r) => String(r.userId || r.user?.id || r.user?._id) === String(user._id || user.id));
      if (myReview) {
        setUserRatingInput(myReview.rating);
        setReviewTextInput(myReview.review || "");
      }
    }
  };

  // Load comments dynamically from backend database
  const loadComments = async () => {
    if (!courseId) return;
    const data = await fetchCourseComments(courseId);
    setComments(data);
  };

  const {
    courseSectionData,
    courseEntireData,
    totalNoOfLectures,
    completedLectures,
  } = useSelector((state) => state.viewCourse);

  // Fetch course details, reviews & comments
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const res = await apiConnector(
          "GET",
          `${COURSE_DETAILS_API}?courseId=${courseId}`,
          null,
          { Authorization: `Bearer ${token}` }
        );

        if (res?.data?.success) {
          const courseData = res.data.data;
          dispatch(setEntireCourseData(courseData));
          dispatch(setCourseSectionData(courseData.courseContent || []));

          const totalLectures = (courseData.courseContent || []).reduce(
            (acc, sec) => acc + (sec.subSection?.length || 0),
            0
          );
          dispatch(setTotalNoOfLectures(totalLectures));
          dispatch(
            setCompletedLectures((courseData.completedVideos || []).map(String))
          );

          if (courseData.courseContent && courseData.courseContent.length > 0) {
            const firstSec = courseData.courseContent[0];
            setActiveSectionId(firstSec._id);
            if (firstSec.subSection && firstSec.subSection.length > 0) {
              setCurrentLecture(firstSec.subSection[0]);
              setCurrentSectionIndex(0);
              setCurrentLectureIndex(0);
            }
          }
        }
      } catch (err) {
        console.error("Error loading take course data:", err);
      }
      setLoading(false);
    };

    if (courseId) {
      fetchCourseData();
      loadReviews();
      loadComments();
    }
  }, [courseId, token, dispatch]);

  const selectLecture = (secIndex, lecIndex, sectionId, lecture) => {
    setCurrentSectionIndex(secIndex);
    setCurrentLectureIndex(lecIndex);
    setActiveSectionId(sectionId);
    setCurrentLecture(lecture);
    setShowPractice(false);
  };

  const isCompleted = (lecId) => completedLectures.includes(String(lecId));

  // Access rules: Free users can only view first 2 videos
  const userPlan = courseEntireData?.userPlan || "gold";
  const getLectureGlobalIndex = (sIdx, lIdx) => {
    let count = 0;
    for (let i = 0; i < sIdx; i++) {
      count += courseSectionData[i]?.subSection?.length || 0;
    }
    return count + lIdx;
  };

  const isLectureLocked = (sIdx, lIdx) => {
    if (userPlan === "free") {
      const gIndex = getLectureGlobalIndex(sIdx, lIdx);
      return gIndex >= 2;
    }
    return false;
  };

  // Persistent comment post
  const handlePostComment = async () => {
    if (!newComment.trim() && !commentImage) return;
    const res = await postCommentAPI({ courseId, text: newComment, image: commentImage }, token);
    if (res) {
      setNewComment("");
      setCommentImage(null);
      loadComments();
    }
  };

  // Persistent comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;
    const targetId = String(commentId);
    // Optimistically remove from state for instant response
    setComments((prev) => prev.filter((item) => String(item.id || item._id) !== targetId));
    const success = await deleteCommentAPI(commentId, token);
    if (!success) {
      loadComments();
    }
  };

  // Dynamic rating submission (Upsert - 1 review per user)
  const handleSubmitRating = async () => {
    if (!userRatingInput) return;
    const success = await createRating(
      {
        courseId,
        rating: userRatingInput,
        review: reviewTextInput,
      },
      token
    );
    if (success) {
      loadReviews();
    }
  };

  // Calculate dynamic course total duration in hours and minutes
  let totalDurationSeconds = 0;
  if (courseSectionData && Array.isArray(courseSectionData)) {
    courseSectionData.forEach((sec) => {
      if (sec.subSection && Array.isArray(sec.subSection)) {
        sec.subSection.forEach((sub) => {
          const dur = parseFloat(sub.timeDuration || sub.duration || 0);
          if (!isNaN(dur)) {
            totalDurationSeconds += dur;
          }
        });
      }
    });
  }
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const formattedDuration = `${totalHours > 0 ? `${totalHours}h ` : ''}${totalMinutes}m`;

  // Calculate dynamic average rating and review counts
  const totalReviewsCount = reviewsList.length;
  const avgRatingNum =
    totalReviewsCount > 0
      ? (reviewsList.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviewsCount).toFixed(1)
      : 0;

  // Complete and Continue handler
  const handleCompleteAndContinue = async () => {
    if (!currentLecture) return;

    if (!isCompleted(currentLecture._id)) {
      try {
        const res = await markLectureAsComplete(
          { courseId, subSectionId: currentLecture._id },
          token
        );
        if (res) {
          dispatch(updateCompletedLectures(String(currentLecture._id)));
        }
      } catch (err) {
        console.error("Failed to mark completed:", err);
      }
    }

    const currentSubSections =
      courseSectionData[currentSectionIndex]?.subSection || [];
    if (currentLectureIndex < currentSubSections.length - 1) {
      const nextLec = currentSubSections[currentLectureIndex + 1];
      selectLecture(
        currentSectionIndex,
        currentLectureIndex + 1,
        activeSectionId,
        nextLec
      );
    } else if (currentSectionIndex < courseSectionData.length - 1) {
      const nextSec = courseSectionData[currentSectionIndex + 1];
      setActiveSectionId(nextSec._id);
      if (nextSec.subSection && nextSec.subSection.length > 0) {
        selectLecture(
          currentSectionIndex + 1,
          0,
          nextSec._id,
          nextSec.subSection[0]
        );
      }
    }
  };

  // Previous lecture handler
  const handlePrevious = () => {
    if (currentLectureIndex > 0) {
      const prevLec =
        courseSectionData[currentSectionIndex].subSection[currentLectureIndex - 1];
      selectLecture(
        currentSectionIndex,
        currentLectureIndex - 1,
        activeSectionId,
        prevLec
      );
    } else if (currentSectionIndex > 0) {
      const prevSec = courseSectionData[currentSectionIndex - 1];
      const prevSubSections = prevSec.subSection || [];
      setActiveSectionId(prevSec._id);
      if (prevSubSections.length > 0) {
        selectLecture(
          currentSectionIndex - 1,
          prevSubSections.length - 1,
          prevSec._id,
          prevSubSections[prevSubSections.length - 1]
        );
      }
    }
  };

  const isFirstLecture = currentSectionIndex === 0 && currentLectureIndex === 0;

  const progressPercentage =
    totalNoOfLectures > 0
      ? Math.round((completedLectures.length / totalNoOfLectures) * 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentLocked = isLectureLocked(currentSectionIndex, currentLectureIndex);

  return (
    <div className="h-screen bg-white text-slate-800 flex flex-col font-['Inter',sans-serif] overflow-hidden">
      {/* TOP HEADER */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-20 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 text-indigo-700 transition"
            title="Toggle Curriculum Sidebar"
          >
            <FiMenu size={20} />
          </button>

          <h1 className="font-bold text-base text-slate-900 line-clamp-1 max-w-md">
            {courseEntireData?.courseName || "Course Player"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/s/courses/${courseId}/take/pratice-test`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-800 text-white transition shadow-sm"
          >
            <span>🎯 Practice / Tests</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition">
            <FaComments size={14} />
            <span>Discuss ({comments.length})</span>
          </button>

          <button
            onClick={handlePrevious}
            disabled={isFirstLecture}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              isFirstLecture
                ? "text-slate-300 cursor-not-allowed"
                : "text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            <FiChevronLeft size={16} /> Previous
          </button>

          <button
            onClick={handleCompleteAndContinue}
            className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            Complete and Continue <FiChevronRight size={16} />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT CURRICULUM SIDEBAR */}
        {sidebarOpen && (
          <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 select-none overflow-y-auto h-full">
            <div className="p-5 border-b border-slate-200 space-y-2">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs font-bold text-slate-700">
                {progressPercentage}% completed{" "}
                <span className="font-normal text-slate-400">in {formattedDuration}</span>
              </p>
            </div>

            <div className="px-5 py-3 border-b border-slate-200">
              <button className="flex items-center justify-between w-full text-xs font-bold text-indigo-700 hover:underline">
                <span className="flex items-center gap-2">
                  <FaComments size={15} /> Course Discussions
                </span>
                <FiExternalLink size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {courseSectionData.map((section, sIdx) => {
                const isOpen = activeSectionId === section._id;
                return (
                  <div key={section._id} className="border-b border-slate-100">
                    <button
                      onClick={() =>
                        setActiveSectionId(isOpen ? "" : section._id)
                      }
                      className="w-full px-5 py-3 text-left font-bold text-xs text-slate-800 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span className="line-clamp-1">{section.sectionName}</span>
                      <span className="text-slate-400 font-normal text-[10px]">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="bg-slate-50/50 py-1">
                        {section.subSection?.map((lecture, lIdx) => {
                          const active =
                            currentSectionIndex === sIdx &&
                            currentLectureIndex === lIdx;
                          const completed = isCompleted(lecture._id);
                          const locked = isLectureLocked(sIdx, lIdx);

                          return (
                            <button
                              key={lecture._id}
                              disabled={locked}
                              onClick={() =>
                                selectLecture(sIdx, lIdx, section._id, lecture)
                              }
                              className={`w-full text-left px-7 py-2.5 flex items-center justify-between text-xs transition ${
                                active
                                  ? "bg-white font-bold text-indigo-600 border-l-4 border-indigo-600 shadow-sm"
                                  : "text-slate-600 hover:bg-slate-100"
                              } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <div className="flex items-center gap-2.5 line-clamp-1 pr-2">
                                {locked ? (
                                  <FiLock className="text-amber-500 shrink-0" size={14} />
                                ) : completed ? (
                                  <FiCheckCircle className="text-emerald-500 shrink-0" size={14} />
                                ) : (
                                  <FiPlayCircle className="text-indigo-400 shrink-0" size={14} />
                                )}
                                <span className="line-clamp-1">
                                  {lecture.title}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                onClick={() => {
                  if (progressPercentage >= 100) {
                    navigate(`/s/courses/${courseId}/certificate`);
                  } else {
                    setShowCertModal(true);
                  }
                }}
                className={`w-full flex items-center justify-between text-xs font-bold p-3 rounded-xl border transition ${
                  progressPercentage >= 100
                    ? "border-amber-400 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md hover:from-amber-600 hover:to-amber-700"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiAward size={18} className={progressPercentage >= 100 ? "text-white animate-bounce" : "text-amber-500"} />
                  <div className="text-left">
                    <p className="font-extrabold line-clamp-1">
                      {progressPercentage >= 100 ? "🏆 View Certificate" : "🔒 Certificate"}
                    </p>
                    <p className="text-[10px] font-normal opacity-80">
                      {progressPercentage >= 100 ? "Unlocked & Ready" : "Complete course to unlock"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-white/20 text-current">
                  {progressPercentage}%
                </span>
              </button>
            </div>
          </aside>
        )}

        {/* INCOMPLETE COURSE CERTIFICATE MODAL */}
        {showCertModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 shadow-inner">
                <FiLock size={30} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-slate-900">
                  🔒 Certificate Locked
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Please complete the full course to unlock and receive your certificate.
                </p>
              </div>

              {/* DYNAMIC PROGRESS INDICATOR */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Course Progress</span>
                  <span className="text-indigo-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setShowCertModal(false)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-150"
              >
                Continue Course
              </button>
            </div>
          </div>
        )}

        {/* MAIN PLAYER AREA */}
        <main className="flex-1 bg-white flex flex-col justify-between overflow-y-auto">
          {showPractice ? (
            <div className="flex-1 overflow-y-auto bg-[#090D16]">
              <CoursePracticeTab />
            </div>
          ) : currentLocked ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-800 p-8 space-y-4">
              <FiLock size={48} className="text-amber-500" />
              <h2 className="text-lg font-bold">This lesson is locked</h2>
              <p className="text-xs text-slate-600 max-w-md text-center">
                Your Free plan allows access to the first 2 lessons. Upgrade to Silver or Gold to unlock the full course curriculum.
              </p>
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition"
              >
                Upgrade Plan
              </button>
            </div>
          ) : currentLecture?.videoUrl ? (
            <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-center">
              <div className="w-full bg-black rounded-xl overflow-hidden shadow-lg border border-slate-200 flex items-center justify-center">
                <video
                  key={currentLecture._id}
                  src={currentLecture.videoUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[calc(100vh-12rem)] object-contain rounded-xl"
                  onEnded={handleCompleteAndContinue}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 space-y-2">
              <FiPlayCircle size={48} />
              <p className="text-sm font-semibold">Select a lecture to start learning</p>
            </div>
          )}

          {/* LESSON DETAILS & DYNAMIC DISCUSSION / RATING */}
          <div className="p-6 md:p-8 bg-white space-y-8 max-w-5xl mx-auto w-full font-['Inter',sans-serif]">
            {/* LESSON TITLE & DESCRIPTION */}
            <div className="space-y-2 pb-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                {currentLecture?.title || "Lesson Overview"}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentLecture?.description ||
                  courseEntireData?.courseDescription ||
                  "No additional lesson description available."}
              </p>
            </div>

            {/* DISCUSSION SECTION - MATCHING TARGET SCREENSHOT 2 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Discuss</h3>
                <span className="text-xs font-medium text-slate-500">
                  {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                </span>
              </div>

              {/* MAIN DISCUSSION LAYOUT GRID (EDITOR + TRENDING TAGS SIDEBAR) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* LEFT: EDITOR & COMMENTS AREA (3 COLS ON DESKTOP) */}
                <div className="lg:col-span-3 space-y-3">
                  {/* DYNAMIC RICH TEXT TOOLBAR */}
                  <div className="flex items-center gap-4 text-slate-700 text-sm font-semibold border-b border-slate-200 pb-2 select-none">
                    <button
                      type="button"
                      onClick={() => {
                        setNewComment((prev) => prev ? `**${prev}**` : '**Bold Text**');
                      }}
                      className="hover:text-indigo-600 font-bold px-1"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewComment((prev) => prev ? `*${prev}*` : '*Italic Text*');
                      }}
                      className="hover:text-indigo-600 italic px-1"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewComment((prev) => prev ? `_${prev}_` : '_Underline Text_');
                      }}
                      className="hover:text-indigo-600 underline px-1"
                      title="Underline"
                    >
                      U
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewComment((prev) => prev + (prev ? '\n• ' : '• '));
                      }}
                      className="hover:text-indigo-600 px-1"
                      title="Bullet List"
                    >
                      •
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewComment((prev) => prev + (prev ? '\n1. ' : '1. '));
                      }}
                      className="hover:text-indigo-600 px-1"
                      title="Numbered List"
                    >
                      ☷
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter URL link:');
                        if (url) {
                          setNewComment((prev) => `${prev} [Link](${url})`);
                        }
                      }}
                      className="hover:text-indigo-600 px-1"
                      title="Add Link"
                    >
                      🔗
                    </button>
                  </div>

                  {/* OPEN TEXTAREA */}
                  <textarea
                    rows={4}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 resize-none shadow-sm"
                  />

                  {/* PREVIEW ATTACHED IMAGE IF SELECTED */}
                  {commentImage && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-300 group shadow-sm">
                      <img src={commentImage} alt="Attached Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCommentImage(null)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs shadow hover:bg-red-700 transition"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* ADD IMAGE & POST ACTIONS */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition border border-slate-200 px-3 py-1.5 rounded bg-white cursor-pointer">
                      <span>📷</span> {uploadingImage ? 'Uploading...' : 'Add Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCommentImage(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <button
                      onClick={handlePostComment}
                      className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-md transition shadow-sm"
                    >
                      Post
                    </button>
                  </div>

                  {/* DYNAMIC COMMENTS LIST FROM DATABASE */}
                  <div className="space-y-4 pt-6">
                    {comments.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">
                        No comments yet. Be the first to start the discussion!
                      </p>
                    ) : (
                      comments.map((c) => {
                        const commenterName = c.user
                          ? `${c.user.firstName || ''} ${c.user.lastName || ''}`.trim()
                          : c.user_name || "Student";
                        const commenterImage = c.user?.image || c.userImage;
                        const isMyComment = user && String(c.userId || c.user?.id || c.user?._id) === String(user.id || user._id);

                        return (
                          <div
                            key={c.id || c._id}
                            className="border-b border-slate-200 pb-4 flex items-start gap-3"
                          >
                            {commenterImage ? (
                              <img
                                src={commenterImage}
                                alt={commenterName}
                                className="w-9 h-9 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                {commenterName[0] || "U"}
                              </div>
                            )}
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900">
                                  {commenterName}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">
                                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recently'}
                                  </span>
                                  {(isMyComment || user?.accountType === 'Admin') && (
                                    <button
                                      onClick={() => handleDeleteComment(c.id || c._id)}
                                      className="text-slate-400 hover:text-red-500 transition p-1"
                                      title="Delete comment"
                                    >
                                      <FiTrash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {c.text}
                              </p>
                              {c.image && (
                                <div className="pt-2">
                                  <img
                                    src={c.image}
                                    alt="Comment Attachment"
                                    className="max-h-60 rounded-md object-contain border border-slate-200"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT: TRENDING TAGS SIDEBAR WITH BORDER SEPARATION */}
                <div className="lg:col-span-1 border border-slate-200 bg-white rounded-md p-5 space-y-3 shadow-sm h-fit">
                  <h4 className="text-xs font-bold text-slate-700 text-center tracking-wider">
                    Trending Tags
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed text-center">
                    Use <span className="font-semibold text-indigo-600">#hashtags</span> in your post to create one.
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                    <span className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition">
                      #patterns
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition">
                      #javascript
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition">
                      #dsa
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DYNAMIC COURSE RATING & REVIEWS SECTION */}
            <div className="space-y-6 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Course Rating & Reviews</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-amber-500 font-bold text-sm">★ {avgRatingNum}</span>
                    <span className="text-xs text-slate-400">({totalReviewsCount} {totalReviewsCount === 1 ? 'rating' : 'ratings'})</span>
                  </div>
                </div>
              </div>

              {/* RATING FORM */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                <p className="text-xs font-bold text-slate-700">Rate this course:</p>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRatingInput(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        star <= userRatingInput ? "text-amber-400" : "text-slate-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  placeholder="Share your experience with this course..."
                  value={reviewTextInput}
                  onChange={(e) => setReviewTextInput(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitRating}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition shadow-sm"
                  >
                    Submit Review
                  </button>
                </div>
              </div>

              {/* DYNAMIC REVIEWS LIST FROM DATABASE */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold text-slate-800">Student Reviews ({totalReviewsCount})</h4>
                {reviewsList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No reviews submitted yet for this course.</p>
                ) : (
                  reviewsList.map((r) => {
                    const reviewerName = r.user ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() : "Student";
                    const reviewerImage = r.user?.image;

                    return (
                      <div key={r.id || r._id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {reviewerImage ? (
                              <img src={reviewerImage} alt={reviewerName} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                                {reviewerName[0] || 'U'}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-800">{reviewerName}</p>
                              <div className="flex items-center gap-1 text-amber-400 text-xs">
                                {"★".repeat(r.rating || 5)}
                                <span className="text-slate-300">{"★".repeat(5 - (r.rating || 5))}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {r.updatedAt
                              ? new Date(r.updatedAt).toLocaleDateString()
                              : r.createdAt
                              ? new Date(r.createdAt).toLocaleDateString()
                              : new Date().toLocaleDateString()}
                          </span>
                        </div>
                        {r.review && (
                          <p className="text-xs text-slate-600 leading-relaxed pt-1">
                            {r.review}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseTakePlayer;
