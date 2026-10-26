import React from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {editCourseDetails,addCourseDetails, fetchCourseCategories} from '../../../../../services/operations/courseDetailsAPI'
import { useForm } from 'react-hook-form'
import {HiOutlineCurrencyRupee} from "react-icons/hi"
import RequirementField from './RequirementField'
import Iconbtn from '../../../../Common/iconbtn'
import {setStep,setCourse} from "../../../../../services/slices/courseSlice"
import {toast} from 'react-hot-toast'
import {COURSE_STATUS} from "../../../../../utils/constants"
import ChipInput from './ChipInput'
import Upload from '../Upload'
import { MdNavigateNext } from "react-icons/md"

export default function CourseInformationForm() {
    const {
      register,
      handleSubmit,
      setValue,
      getValues,
      formState: { errors },
    } = useForm()
  
    const dispatch = useDispatch()
    const { token } = useSelector((state) => state.auth)
    const { course, editCourse } = useSelector((state) => state.course)
    const [loading, setLoading] = useState(false)
    const [courseCategories, setCourseCategories] = useState([])
  
    useEffect(() => {
      const getCategories = async () => {
        setLoading(true)
        const categories = await fetchCourseCategories()
        if (categories.length > 0) {
          // console.log("categories", categories)
          setCourseCategories(categories)
        }
        setLoading(false)
      }
      // if form is in edit mode
      if (editCourse && course) {
        let parsedTags = course.tag || []
        if (typeof parsedTags === 'string') {
          try { parsedTags = JSON.parse(parsedTags) } catch { parsedTags = parsedTags.split(',').map(s => s.trim()).filter(Boolean) }
        }
        let parsedReqs = course.instructions || []
        if (typeof parsedReqs === 'string') {
          try { parsedReqs = JSON.parse(parsedReqs) } catch { parsedReqs = parsedReqs.split(',').map(s => s.trim()).filter(Boolean) }
        }

        setValue("courseTitle", course.courseName || '')
        setValue("courseShortDesc", course.courseDescription || '')
        setValue("coursePrice", course.price || '')
        setValue("courseTags", parsedTags)
        setValue("courseBenefits", course.whatYouWillLearn || '')
        const catId = typeof course.category === 'object' ? course.category?._id || course.category?.id || course.categoryId : course.category || course.categoryId
        setValue("courseCategory", catId)
        setValue("courseRequirements", parsedReqs)
        setValue("courseImage", course.thumbnail || null)
      }
      getCategories()
  
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  
    const isFormUpdated = () => {
      const currentValues = getValues()
      const courseCatId = typeof course.category === 'object' ? (course.category?._id || course.category?.id || course.categoryId) : (course.category || course.categoryId)
      const currentTags = Array.isArray(currentValues.courseTags) ? currentValues.courseTags.toString() : String(currentValues.courseTags || '')
      const courseTags = Array.isArray(course.tag) ? course.tag.toString() : String(course.tag || '')
      const currentReqs = Array.isArray(currentValues.courseRequirements) ? currentValues.courseRequirements.toString() : String(currentValues.courseRequirements || '')
      const courseReqs = Array.isArray(course.instructions) ? course.instructions.toString() : String(course.instructions || '')

      if (
        currentValues.courseTitle !== course.courseName ||
        currentValues.courseShortDesc !== course.courseDescription ||
        String(currentValues.coursePrice) !== String(course.price) ||
        currentTags !== courseTags ||
        currentValues.courseBenefits !== course.whatYouWillLearn ||
        String(currentValues.courseCategory) !== String(courseCatId) ||
        currentReqs !== courseReqs ||
        (currentValues.courseImage && currentValues.courseImage !== course.thumbnail)
      ) {
        return true
      }
      return false
    }
  
    //   handle next button click
    const onSubmit = async (data) => {
      const cId = course?._id || course?.id;

      if (editCourse) {
        if (isFormUpdated()) {
          const currentValues = getValues()
          const formData = new FormData()
          formData.append("courseId", cId)
          if (currentValues.courseTitle !== course.courseName) {
            formData.append("courseName", data.courseTitle)
          }
          if (currentValues.courseShortDesc !== course.courseDescription) {
            formData.append("courseDescription", data.courseShortDesc)
          }
          if (String(currentValues.coursePrice) !== String(course.price)) {
            formData.append("price", data.coursePrice)
          }
          const currentTags = Array.isArray(currentValues.courseTags) ? currentValues.courseTags.toString() : String(currentValues.courseTags || '')
          const courseTags = Array.isArray(course.tag) ? course.tag.toString() : String(course.tag || '')
          if (currentTags !== courseTags) {
            formData.append("tag", JSON.stringify(data.courseTags))
          }
          if (currentValues.courseBenefits !== course.whatYouWillLearn) {
            formData.append("whatYouWillLearn", data.courseBenefits)
          }
          const courseCatId = typeof course.category === 'object' ? (course.category?._id || course.category?.id || course.categoryId) : (course.category || course.categoryId)
          if (String(currentValues.courseCategory) !== String(courseCatId)) {
            formData.append("category", data.courseCategory)
          }
          const currentReqs = Array.isArray(currentValues.courseRequirements) ? currentValues.courseRequirements.toString() : String(currentValues.courseRequirements || '')
          const courseReqs = Array.isArray(course.instructions) ? course.instructions.toString() : String(course.instructions || '')
          if (currentReqs !== courseReqs) {
            formData.append(
              "instructions",
              JSON.stringify(data.courseRequirements)
            )
          }
          if (currentValues.courseImage && currentValues.courseImage !== course.thumbnail) {
            formData.append("thumbnailImage", data.courseImage)
          }
          setLoading(true)
          const result = await editCourseDetails(formData, token)
          setLoading(false)
          if (result) {
            dispatch(setStep(2))
            dispatch(setCourse(result))
          }
        } else {
          dispatch(setStep(2))
        }
        return
      }
  
      const formData = new FormData()
      formData.append("courseName", data.courseTitle)
      formData.append("courseDescription", data.courseShortDesc)
      formData.append("price", data.coursePrice)
      formData.append("planPrices", JSON.stringify({
        basic: Number(data.basicPrice || 499),
        plus: Number(data.coursePrice || 4999),
        pro: Number(data.proPrice || 6999)
      }))
      formData.append("tag", JSON.stringify(data.courseTags))
      formData.append("whatYouWillLearn", data.courseBenefits)
      formData.append("category", data.courseCategory)
      formData.append("status", COURSE_STATUS.DRAFT)
      formData.append("instructions", JSON.stringify(data.courseRequirements))
      formData.append("thumbnailImage", data.courseImage)
      setLoading(true)
      const result = await addCourseDetails(formData, token)
      if (result) {
        dispatch(setStep(2))
        dispatch(setCourse(result))
      }
      setLoading(false)
    }
  
    return (
     <form
  onSubmit={handleSubmit(onSubmit)}
  className="max-w-4xl mx-auto space-y-8 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]"
>
  <div className="space-y-6">

    {/* HEADER */}
    <div className="border-b border-slate-100 pb-4 flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
        📄
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Course Information
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Fill in the details to create or update your course. Make it compelling and informative.
        </p>
      </div>
    </div>

    {/* TITLE */}
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-slate-700">
        Course Title <sup className="text-red-500">*</sup>
      </label>
      <input
        {...register("courseTitle", { required: true })}
        placeholder="e.g. Complete MERN Stack Bootcamp"
        className="w-full rounded-xl bg-white px-4 py-3 text-[13px] text-slate-900 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-slate-400 shadow-sm"
      />
      {errors.courseTitle && (
        <span className="text-[11px] font-semibold text-red-500">Title is required</span>
      )}
    </div>

    {/* DESCRIPTION */}
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-slate-700">
        Short Description <sup className="text-red-500">*</sup>
      </label>
      <textarea
        {...register("courseShortDesc", { required: true })}
        placeholder="Enter short overview of the course"
        className="w-full min-h-[110px] rounded-xl bg-white px-4 py-3 text-[13px] text-slate-900 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-slate-400 shadow-sm"
      />
      {errors.courseShortDesc && (
        <span className="text-[11px] font-semibold text-red-500">Description is required</span>
      )}
    </div>

    {/* 3 PLAN PRICING INPUTS (BASIC, PLUS, PRO) */}
    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
        Course Subscription Plan Pricing <sup className="text-red-500">*</sup>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* BASIC PLAN */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-slate-700">
            Basic Plan (1 Mo) <sup className="text-red-500">*</sup>
          </label>
          <div className="relative">
            <input
              {...register("basicPrice", { required: true })}
              placeholder="e.g. 499"
              defaultValue={course?.planPrices?.basic || course?.pricing?.basicPrice || 499}
              className="w-full rounded-xl bg-white pl-8 pr-3 py-2.5 text-[13px] text-slate-900 border border-slate-200 focus:border-blue-500 outline-none shadow-xs font-semibold"
            />
            <HiOutlineCurrencyRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          </div>
        </div>

        {/* PLUS PLAN */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-slate-700">
            Plus Plan (1 Yr) <sup className="text-red-500">*</sup>
          </label>
          <div className="relative">
            <input
              {...register("coursePrice", { required: true })}
              placeholder="e.g. 4999"
              defaultValue={course?.price || course?.planPrices?.plus || 4999}
              className="w-full rounded-xl bg-white pl-8 pr-3 py-2.5 text-[13px] text-slate-900 border border-slate-200 focus:border-blue-500 outline-none shadow-xs font-semibold"
            />
            <HiOutlineCurrencyRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          </div>
        </div>

        {/* PRO PLAN */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-slate-700">
            Pro Plan (2 Yrs) <sup className="text-red-500">*</sup>
          </label>
          <div className="relative">
            <input
              {...register("proPrice", { required: true })}
              placeholder="e.g. 6999"
              defaultValue={course?.planPrices?.pro || course?.pricing?.proPrice || 6999}
              className="w-full rounded-xl bg-white pl-8 pr-3 py-2.5 text-[13px] text-slate-900 border border-slate-200 focus:border-blue-500 outline-none shadow-xs font-semibold"
            />
            <HiOutlineCurrencyRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          </div>
        </div>
      </div>
    </div>

    {/* CATEGORY */}
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-slate-700">
        Course Category <sup className="text-red-500">*</sup>
      </label>
      <select
        {...register("courseCategory", { required: true })}
        className="w-full rounded-xl bg-white px-4 py-3 text-[13px] text-slate-900 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition shadow-sm appearance-none"
      >
        <option value="">Choose Category</option>
        {courseCategories?.map((cat, i) => (
          <option key={i} value={cat._id}>{cat.name}</option>
        ))}
      </select>
      {errors.courseCategory && (
        <span className="text-[11px] font-semibold text-red-500">Category is required</span>
      )}
    </div>

    {/* TAGS */}
    <ChipInput
      label="Tags"
      name="courseTags"
      placeholder="Press Enter to add tags"
      register={register}
      errors={errors}
      setValue={setValue}
      getValues={getValues}
    />

    {/* IMAGE */}
    <Upload
      name="courseImage"
      label="Course Thumbnail"
      register={register}
      setValue={setValue}
      errors={errors}
      editData={editCourse ? course?.thumbnail : null}
    />

    {/* BENEFITS */}
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-slate-700">
        Course Benefits <sup className="text-red-500">*</sup>
      </label>
      <textarea
        {...register("courseBenefits", { required: true })}
        placeholder="Enter key benefits students will gain"
        className="w-full min-h-[100px] rounded-xl bg-white px-4 py-3 text-[13px] text-slate-900 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-slate-400 shadow-sm"
      />
      {errors.courseBenefits && (
        <span className="text-[11px] font-semibold text-red-500">Benefits are required</span>
      )}
    </div>

    {/* REQUIREMENTS */}
    <RequirementField
      name="courseRequirements"
      label="Requirements / Instructions"
      register={register}
      setValue={setValue}
      errors={errors}
      getValues={getValues}
    />

    {/* BUTTONS */}
    <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
      {editCourse && (
        <button
          type="button"
          onClick={() => dispatch(setStep(2))}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-[13px] font-bold transition shadow-sm"
        >
          Continue to Builder
        </button>
      )}

      <button
        disabled={loading}
        type="button"
        className="px-5 py-2.5 rounded-xl border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 text-[13px] font-bold transition"
      >
        Save as Draft
      </button>

      <button
        disabled={loading}
        type="submit"
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
      >
        <span>{!editCourse ? "Next Step" : "Save Changes"}</span>
        <MdNavigateNext size={18} />
      </button>
    </div>

  </div>
</form>
    )
  }