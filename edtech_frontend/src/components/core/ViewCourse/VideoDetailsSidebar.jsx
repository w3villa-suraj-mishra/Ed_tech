import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BsCheckCircleFill, BsPlayFill } from 'react-icons/bs';
import { AiOutlineDown } from 'react-icons/ai';
import { FiArrowLeft } from 'react-icons/fi';

const VideoDetailsSidebar = ({ setReviewModal }) => {
  const [activeSection, setActiveSection] = useState('');
  const [activeLecture, setActiveLecture] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, sectionId, subSectionId } = useParams();
  const activeLectureRef = useRef(null);

  const {
    courseSectionData,
    courseEntireData,
    totalNoOfLectures,
    completedLectures,
  } = useSelector((state) => state.viewCourse);

  // Sync active state with URL params
  useEffect(() => {
    setActiveSection(String(sectionId || ''));
    setActiveLecture(String(subSectionId || ''));
  }, [sectionId, subSectionId]);

  // Auto-scroll active lecture into view
  useEffect(() => {
    if (activeLectureRef.current) {
      activeLectureRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeLecture]);

  const progress = totalNoOfLectures > 0
    ? Math.round((completedLectures.length / totalNoOfLectures) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full text-white bg-richblack-800">

      {/* HEADER */}
      <div className="p-5 border-b border-richblack-700 space-y-4">
        <button
          onClick={() => navigate('/dashboard/courses')}
          className="flex items-center gap-2 text-sm text-richblack-300 hover:text-white transition"
        >
          <FiArrowLeft /> Back to My Courses
        </button>

        <div>
          <h2 className="font-bold text-white text-base leading-snug line-clamp-2">
            {courseEntireData?.courseName || 'Course'}
          </h2>
          <p className="text-xs text-richblack-400 mt-1">
            {completedLectures.length} / {totalNoOfLectures} completed
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-richblack-300">
            <span>Progress</span>
            <span className="font-semibold text-yellow-400">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-richblack-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECTIONS + LECTURES */}
      <div className="flex-1 overflow-y-auto py-2">
        {courseSectionData.map((section, si) => {
          const isOpen = String(activeSection) === String(section._id);
          const sectionCompleted = section.subSection.every(
            (ss) => completedLectures.includes(String(ss._id))
          );

          return (
            <div key={section._id} className="border-b border-richblack-700/50">

              {/* SECTION HEADER */}
              <button
                onClick={() => setActiveSection(isOpen ? '' : section._id)}
                className="flex w-full items-center justify-between px-5 py-4 hover:bg-richblack-700/50 transition group"
              >
                <div className="flex items-center gap-3 text-left">
                  {sectionCompleted ? (
                    <BsCheckCircleFill className="shrink-0 text-emerald-400" size={16} />
                  ) : (
                    <span className="shrink-0 w-4 h-4 rounded-full border-2 border-richblack-500 group-hover:border-yellow-400 transition" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
                      {section.sectionName}
                    </p>
                    <p className="text-xs text-richblack-400 mt-0.5">
                      {section.subSection?.length || 0} lectures • {section.totalDuration}
                    </p>
                  </div>
                </div>
                <div 
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
                >
                  <AiOutlineDown size={14} className="text-richblack-400 shrink-0" />
                </div>
              </button>

              {/* LECTURES (Vanilla CSS Transition) */}
              <div
                style={{
                  maxHeight: isOpen ? '2000px' : '0px',
                  opacity: isOpen ? 1 : 0,
                  transition: 'max-height 0.4s ease, opacity 0.4s ease',
                  overflow: 'hidden'
                }}
              >
                {section.subSection.map((lecture, li) => {
                  const isActive = String(activeLecture) === String(lecture._id);
                  const isDone = completedLectures.includes(String(lecture._id));

                  return (
                    <div
                      key={lecture._id}
                      ref={isActive ? activeLectureRef : null}
                      onClick={() => {
                        setActiveLecture(lecture._id);
                        navigate(
                          `/view-course/${courseId}/section/${section._id}/sub-section/${lecture._id}`
                        );
                      }}
                      className={`flex items-start gap-3 px-6 py-3 cursor-pointer transition group ${
                        isActive
                          ? 'bg-yellow-400/10 border-l-2 border-yellow-400'
                          : 'hover:bg-richblack-700/40 border-l-2 border-transparent'
                      }`}
                    >
                      {/* ICON */}
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <BsCheckCircleFill size={16} className="text-emerald-400" />
                        ) : lecture.isUnlocked === false ? (
                          <span className="text-xs text-yellow-500 font-bold">🔒</span>
                        ) : isActive ? (
                          <BsPlayFill size={16} className="text-yellow-400" />
                        ) : (
                          <span className="block w-4 h-4 rounded-full border-2 border-richblack-500 group-hover:border-richblack-300 transition" />
                        )}
                      </div>

                      {/* TEXT */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-sm leading-snug line-clamp-2 ${
                            isActive ? 'text-yellow-50 font-semibold' : 'text-richblack-200'
                          }`}>
                            {lecture.title}
                          </p>
                          {lecture.isFreeVideo && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded shrink-0">
                              Free
                            </span>
                          )}
                          {lecture.isUnlocked === false && (
                            <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded shrink-0">
                              Locked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-richblack-400 mt-0.5">
                          {lecture.duration || "00:00"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD REVIEW FOOTER */}
      <div className="p-4 border-t border-richblack-700">
        <button
          onClick={() => setReviewModal && setReviewModal(true)}
          className="w-full py-2.5 rounded-xl border border-yellow-400/30 text-yellow-400 text-sm font-semibold hover:bg-yellow-400/10 transition"
        >
          + Add a Review
        </button>
      </div>
    </div>
  );
};

export default VideoDetailsSidebar;
