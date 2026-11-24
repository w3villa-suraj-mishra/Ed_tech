import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { resetCourseState, setStep } from '../../../../../services/slices/courseSlice'
import { COURSE_STATUS } from '../../../../../utils/constants'
import { editCourseDetails } from '../../../../../services/operations/courseDetailsAPI'

const PublishCourse = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
  } = useForm()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (course?.status === COURSE_STATUS.PUBLISHED) {
      setValue("public", true)
    }
  }, [course, setValue])

  const goBack = () => {
    dispatch(setStep(2))
  }

  const goToCourses = () => {
    dispatch(resetCourseState())
    navigate("/dashboard/my-courses")
  }

  const handleCoursePublish = async () => {
    const isPublic = getValues("public")
    const isAlreadyPublished = course?.status === COURSE_STATUS.PUBLISHED && isPublic === true
    const isAlreadyDraft = course?.status === COURSE_STATUS.DRAFT && isPublic === false

    if (isAlreadyPublished || isAlreadyDraft) {
      goToCourses()
      return
    }

    const cId = course?._id || course?.id
    const formData = new FormData()
    formData.append("courseId", cId)
    const courseStatus = isPublic ? COURSE_STATUS.PUBLISHED : COURSE_STATUS.DRAFT
    formData.append("status", courseStatus)

    setLoading(true)
    const result = await editCourseDetails(formData, token)
    if (result) {
      goToCourses()
    }
    setLoading(false)
  }

  const onSubmit = () => {
    handleCoursePublish()
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] space-y-6'>

        {/* HEADER */}
        <div className="border-b border-slate-100 pb-4 flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold">
            🚀
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Publish Settings
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Choose whether to make your course live to students or save it as a draft.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* CHECKBOX CARD */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 hover:bg-slate-50 transition">
            <label htmlFor='public' className="flex items-start gap-3.5 cursor-pointer select-none">
              <input
                type='checkbox'
                id='public'
                {...register("public")}
                className='mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer'
              />
              <div>
                <span className='font-semibold text-sm text-slate-800 block'>
                  Make this Course Public
                </span>
                <span className='text-xs text-slate-500 mt-0.5 block'>
                  When enabled, this course will be visible in the catalog for students to browse and enroll.
                </span>
              </div>
            </label>
          </div>

          {/* ACTION BUTTONS */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t border-slate-100'>
            <button
              disabled={loading}
              type='button'
              onClick={goBack}
              className='rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer disabled:opacity-50'
            >
              Back
            </button>
            <button
              disabled={loading}
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default PublishCourse;
