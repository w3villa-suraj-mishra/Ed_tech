import React from 'react'
import { FaCheck } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import CourseInformationForm from './CourseInformation/CourseInformationForm'
import PublishCourse from './PublishCourse'
import CourseBuliderForm from "../../Dashboard/AddCourse/CourseBulider/CourseBuliderForm"


const RenderSteps = () => {

    const { step } = useSelector((state) => state.course)

    const steps = [
      {
        id: 1,
        title: "Course Information",
        subtitle: "Basic details about your course"
      },
      {
        id: 2,
        title: "Course Builder",
        subtitle: "Add content and organize"
      },
      {
        id: 3,
        title: "Publish",
        subtitle: "Review and go live"
      },
    ]
  
    return (
      <>
        <div className="relative mb-2 flex w-full justify-center items-center max-w-2xl mx-auto px-10">
          {steps.map((item) => (
            <React.Fragment key={item.id}>
              <div className="flex flex-col items-center z-10">
                <button
                  className={`grid cursor-default aspect-square w-10 place-items-center rounded-full text-sm font-bold transition-all border-2 ${
                    step === item.id
                      ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : step > item.id
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-slate-200 bg-slate-100 text-slate-400"
                  }`}
                >
                  {step > item.id ? (
                    <FaCheck className="text-white text-sm" />
                  ) : (
                    item.id
                  )}
                </button>
              </div>
              {item.id !== steps.length && (
                <div
                  className={`h-[2px] flex-1 mx-2 transition-all ${
                    step > item.id ? "bg-blue-500" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="relative mb-10 flex w-full justify-between max-w-2xl mx-auto">
          {steps.map((item) => (
            <div
              className="flex flex-col items-center text-center w-1/3"
              key={item.id}
            >
              <p
                className={`text-[13px] font-bold transition-colors ${
                  step >= item.id ? "text-slate-900" : "text-slate-500"
                }`}
              >
                {item.title}
              </p>
              <p className={`text-[11px] mt-1 hidden sm:block ${
                  step >= item.id ? "text-slate-500" : "text-slate-400"
                }`}>
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
        {/* Render specific component based on current step */}
        {step === 1 && <CourseInformationForm />}
        {step === 2 && <CourseBuliderForm />}
        {step === 3 && <PublishCourse />}
      </>
    )
  }
export default RenderSteps
