import React from 'react'
import RenderSteps from "./RenderSteps"
import { FaCheck } from 'react-icons/fa'
import { BsFillLightningChargeFill } from 'react-icons/bs'

export default function AddCourse() {
  return (
    <div className="mx-auto w-11/12 max-w-[1200px] py-10 font-['Inter',sans-serif]">
      <div className="flex w-full items-start gap-x-8">
        <div className="flex flex-1 flex-col">
          <h1 className="mb-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            Add Course
          </h1>
          <p className="text-sm text-slate-500 mb-8 font-medium">
            Create a new course and share your knowledge with learners worldwide.
          </p>
          <div className="flex-1">
            <RenderSteps />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:flex sticky top-24 self-start max-w-[360px] flex-1 flex-col gap-6">
          
          {/* Course Upload Tips */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] space-y-4">
            <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-blue-600"><BsFillLightningChargeFill /></span> Course Upload Tips
            </p>
            <ul className="space-y-3 text-[13px] text-slate-600 font-medium">
              {[
                "Set the Course Price option or make it free.",
                "Use a clear and attractive course thumbnail (1024x576).",
                "Write a compelling title and description.",
                "Choose the most relevant category and tags.",
                "Course Builder is where you create & organize lessons, quizzes, and assignments.",
                "Add topics in the Course Builder section to structure your content.",
                "Include requirements so students know what to expect.",
                "Make announcements to notify students.",
                "You can edit all details later from your dashboard."
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="mt-0.5 min-w-[14px] text-blue-500"><FaCheck size={12} /></div>
                  <span className="leading-snug">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Create Amazing Courses */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-6 border border-blue-100/50">
            <p className="text-base font-bold text-slate-800 mb-1">
              Create Amazing Courses
            </p>
            <p className="text-xs text-slate-500 mb-4">Inspire. Teach. Grow. ✦</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">📈</div>
                <p className="text-xs text-slate-600 font-medium leading-tight">Reach thousands of learners worldwide.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">💡</div>
                <p className="text-xs text-slate-600 font-medium leading-tight">Share your expertise and earn passive income.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">👥</div>
                <p className="text-xs text-slate-600 font-medium leading-tight">Build your personal brand as an instructor.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
