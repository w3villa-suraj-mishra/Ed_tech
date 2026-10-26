import { useEffect, useRef, useState } from "react"
import { AiOutlineDown } from "react-icons/ai"
import CourseSubSectionAccordion from "./CourseSubSectionAccordion"

export default function CourseAccordionBar({ course, isActive, handleActive, courseId, isEnrolled, handlePromptBuy }) {
  const contentRef = useRef(null)
  const [active, setActive] = useState(false)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    setActive(isActive?.includes(course._id))
  }, [isActive, course._id])

  useEffect(() => {
    setHeight(active ? contentRef.current.scrollHeight : 0)
  }, [active])

  return (
    <div className="mb-3 rounded-2xl border border-gray-200/90 bg-white shadow-2xs transition-all duration-300 hover:border-[#3BA7F2]/40 overflow-hidden">

      {/* HEADER */}
      <div
        onClick={() => handleActive(course._id)}
        className="flex cursor-pointer items-center justify-between px-5 py-4 group bg-white hover:bg-gray-50/60 transition"
      >
        <div className="flex items-center gap-3">

          {/* ICON */}
          <div
            style={{ transform: active ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
            className="flex items-center justify-center rounded-xl bg-gray-100 p-2 text-gray-600 group-hover:bg-[#3BA7F2]/10 group-hover:text-[#3BA7F2]"
          >
            <AiOutlineDown size={16} />
          </div>

          {/* TITLE */}
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] group-hover:text-[#3BA7F2] transition-colors">
            {course?.sectionName}
          </h3>
        </div>

        {/* LECTURE COUNT & DURATION */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-[#3BA7F2] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
            {course?.subSection?.length || 0} Lectures
          </div>
          <div className="text-xs font-medium text-gray-400">
            {course?.totalDuration}
          </div>
        </div>
      </div>

      {/* CONTENT (Vanilla CSS Transition) */}
      <div
        style={{
          maxHeight: active ? `${height}px` : "0px",
          opacity: active ? 1 : 0,
          transition: "max-height 0.4s ease, opacity 0.4s ease",
          overflow: "hidden"
        }}
      >
        <div
          ref={contentRef}
          className="px-6 pb-6 pt-2 flex flex-col gap-3"
        >
          {course?.subSection?.map((subSec, i) => (
            <div key={i} style={{ transition: `transform 0.3s ease ${i * 0.05}s` }}>
              <CourseSubSectionAccordion 
                subSec={subSec} 
                courseId={courseId}
                sectionId={course._id}
                isEnrolled={isEnrolled}
                handlePromptBuy={handlePromptBuy}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}