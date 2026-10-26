import React from "react"
import { HiOutlineVideoCamera, HiLockClosed } from "react-icons/hi"
import { BsPlayFill } from "react-icons/bs"
import { useNavigate } from "react-router-dom"

function CourseSubSectionAccordion({ subSec, isLocked = false, courseId, sectionId, isEnrolled = false, handlePromptBuy }) {
  const navigate = useNavigate();

  const isFreePreview = Boolean(subSec?.isFreePreview || subSec?.isPreview || subSec?.freePreview);
  const canAccess = Boolean(isEnrolled || isFreePreview);
  const effectiveLocked = isLocked || !canAccess;

  const handleLectureClick = (e) => {
    e.stopPropagation();
    if (canAccess && courseId && sectionId && subSec?._id) {
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${subSec._id}`);
    } else if (handlePromptBuy) {
      handlePromptBuy(subSec?.title);
    }
  };

  return (
    <div 
      onClick={handleLectureClick}
      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer ${
        effectiveLocked
          ? 'bg-gray-50/80 border border-gray-200/60 hover:border-[#3BA7F2]/40 hover:bg-sky-50/30'
          : 'bg-white hover:bg-sky-50/70 border border-transparent hover:border-sky-100 hover:shadow-2xs'
      }`}
    >
      {/* LEFT: ICON + TITLE + BADGES */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex items-center justify-center rounded-lg p-1.5 transition-all duration-200 shrink-0 ${
          effectiveLocked
            ? 'bg-gray-100 text-gray-400 group-hover:bg-sky-100 group-hover:text-[#3BA7F2]'
            : 'bg-sky-100/70 text-[#3BA7F2] group-hover:bg-[#3BA7F2] group-hover:text-white'
        }`}>
          <HiOutlineVideoCamera size={16} />
        </div>

        <p className="text-xs sm:text-sm font-semibold text-[#0F172A] transition-colors group-hover:text-[#3BA7F2] truncate">
          {subSec?.title}
        </p>

        {isFreePreview && !isEnrolled && (
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
            Preview
          </span>
        )}
      </div>

      {/* RIGHT: DURATION & PLAY/LOCK ICON */}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {subSec?.timeDuration && (
          <span className="text-[11px] font-medium text-gray-400">
            {subSec.timeDuration}
          </span>
        )}
        {effectiveLocked ? (
          <HiLockClosed size={15} className="text-gray-400 group-hover:text-[#3BA7F2] transition-colors" />
        ) : (
          <BsPlayFill size={18} className="text-[#3BA7F2] opacity-80 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  )
}

export default CourseSubSectionAccordion