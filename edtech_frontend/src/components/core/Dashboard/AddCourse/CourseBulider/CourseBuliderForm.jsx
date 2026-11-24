import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { MdAddCircleOutline } from "react-icons/md"
import { BiRightArrow } from "react-icons/bi"
import { useDispatch, useSelector } from 'react-redux';
import { setCourse, setEditCourse, setStep } from '../../../../../services/slices/courseSlice';
import { toast } from 'react-hot-toast';
import { createSection, updateSection, getFullDetailsOfCourse } from '../../../../../services/operations/courseDetailsAPI';
import NestedView from './NestedView';

const CourseBuilderForm = () => {

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [editSectionName, setEditSectionName] = useState(null);
  const { course } = useSelector((state) => state.course);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const { courseId: paramCourseId } = useParams();

  const targetCourseId = course?._id || course?.id || paramCourseId;

  useEffect(() => {
    const hasSections = (Array.isArray(course?.courseContent) && course.courseContent.length > 0) ||
                        (Array.isArray(course?.sections) && course.sections.length > 0);

    if (targetCourseId && !hasSections && token) {
      (async () => {
        try {
          const res = await getFullDetailsOfCourse(targetCourseId, token);
          const fullCourse = res?.courseDetails || res?.data?.courseDetails || res?.data || res;
          if (fullCourse && (fullCourse._id || fullCourse.id || fullCourse.courseName)) {
            dispatch(setCourse(fullCourse));
          }
        } catch (err) {
          console.error("Could not fetch full course details in CourseBuilderForm:", err);
        }
      })();
    }
  }, [targetCourseId, course, token, dispatch]);

  const onSubmit = async (data) => {
    setLoading(true);
    let result;

    if (!targetCourseId) {
      toast.error("Course ID not found. Please complete Step 1 first.");
      setLoading(false);
      return;
    }

    if (editSectionName) {
      result = await updateSection(
        {
          sectionName: data.sectionName,
          sectionId: editSectionName,
          courseId: targetCourseId,
        }, token
      )
    }
    else {
      result = await createSection({
        sectionName: data.sectionName,
        courseId: targetCourseId,
      }, token)
    }

    if (result && !Array.isArray(result) && (result._id || result.id || result.courseContent || result.sections)) {
      dispatch(setCourse(result));
      setEditSectionName(null);
      setValue("sectionName", "");
    }

    setLoading(false);
  }

  const cancelEdit = () => {
    setEditSectionName(null);
    setValue("sectionName", "");
  }

  const goBack = () => {
    dispatch(setStep(1));
    dispatch(setEditCourse(true));
  }

  const goToNext = () => {
    const sections = (course?.courseContent && course.courseContent.length > 0)
      ? course.courseContent
      : (course?.sections || []);

    if (sections.length === 0) {
      toast.error("Please add at least one section");
      return;
    }
    if (sections.some(
      (section) => {
        const subs = section.subSection || section.subSections || [];
        return subs.length === 0;
      }
    )) {
      toast.error("Please add at least one lecture in each section");
      return;
    }
    dispatch(setStep(3));
  }

  const handleChangeEditSectionName = (sectionId, sectionName) => {
    if (editSectionName === sectionId) {
      cancelEdit();
      return;
    }

    setEditSectionName(sectionId);
    setValue("sectionName", sectionName);
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>

      {/* FORM CARD */}
      <div className='rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] space-y-6'>

        {/* HEADER */}
        <div className="border-b border-slate-100 pb-4 flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-blue-600 text-xl font-bold">
            📚
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Course Builder
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Organize your course into sections and lectures. Add, preview, or update video content.
            </p>
          </div>
        </div>

        {/* SECTION FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='sectionName' className='text-[13px] font-semibold text-slate-700'>
              Section Name <sup className='text-red-500'>*</sup>
            </label>

            <div className='flex flex-col sm:flex-row gap-3'>
              <input
                id='sectionName'
                placeholder='e.g. Introduction to Course, Advanced Concepts...'
                {...register("sectionName", { required: true })}
                className='flex-1 rounded-xl bg-white px-4 py-3 text-[13px] text-slate-900 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-slate-400 shadow-sm'
              />

              <div className='flex items-center gap-2'>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] px-5 py-3 text-[13px] font-semibold text-white shadow-sm transition disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  <MdAddCircleOutline className="text-lg" />
                  {editSectionName ? "Update Section" : "Create Section"}
                </button>

                {editSectionName && (
                  <button
                    type='button'
                    onClick={cancelEdit}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {errors.sectionName && (
              <span className='text-[11px] font-semibold text-red-500'>
                Section Name is required
              </span>
            )}
          </div>
        </form>

        {/* NESTED VIEW */}
        <div className='mt-6 pt-6 border-t border-slate-100'>
          <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
        </div>

        {/* FOOTER NAV */}
        <div className='flex items-center justify-end gap-3 pt-6 border-t border-slate-100'>
          <button
            type="button"
            onClick={goBack}
            className='rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer'
          >
            Back
          </button>

          <button
            type="button"
            onClick={goToNext}
            className='inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition cursor-pointer'
          >
            Next
            <BiRightArrow className="text-xs" />
          </button>
        </div>

      </div>

    </div>
  )
}

export default CourseBuilderForm;
