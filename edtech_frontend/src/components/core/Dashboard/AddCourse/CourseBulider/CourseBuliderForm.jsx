import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import Iconbtn from "../../../../../components/Common/iconbtn"
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

  const cId = course?._id || course?.id || paramCourseId;

  useEffect(() => {
    const targetCourseId = course?._id || course?.id || paramCourseId;
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
  }, [paramCourseId, token, dispatch]);

  const onSubmit = async (data) => {
    setLoading(true);
    let result;
    const targetCourseId = course?._id || course?.id || paramCourseId;

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
      toast.error("Please add atleast one Section");
      return;
    }
    if (sections.some(
      (section) => {
        const subs = section.subSection || section.subSections || [];
        return subs.length === 0;
      }
    )) {
      toast.error("Please add atleast one lecture in each section");
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
    <div className='text-white max-w-3xl mx-auto'>

      {/* HEADER */}
      <div className='mb-6'>
        <h2 className='text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent'>
          Course Builder
        </h2>
        <p className='text-sm text-richblack-300'>
          Organize your course into sections and lectures
        </p>
      </div>

      {/* FORM CARD */}
      <div className='rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#020617] p-[1px] shadow-xl'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='rounded-2xl bg-richblack-800 p-6 flex flex-col gap-5'
        >

          {/* INPUT */}
          <div className='flex flex-col gap-2'>
            <label htmlFor='sectionName' className='text-sm text-richblack-200'>
              Section Name <sup className='text-blue-400'>*</sup>
            </label>

            <input
              id='sectionName'
              placeholder='e.g. Introduction, Advanced Concepts...'
              {...register("sectionName", { required: true })}
              className='w-full rounded-lg bg-richblack-900 px-4 py-3 text-white outline-none border border-richblack-700 focus:border-yellow-400 transition-all duration-300'
            />

            {errors.sectionName && (
              <span className='text-sm text-blue-400'>
                Section Name is required
              </span>
            )}
          </div>

          {/* BUTTONS */}
          <div className='flex items-center gap-4 mt-4'>

            <Iconbtn
              type="Submit"
              text={editSectionName ? "Update Section" : "Create Section"}
              outline={false}
              customClasses={"bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-[1.02] transition-all duration-300"}
            >
              <MdAddCircleOutline size={20} />
            </Iconbtn>

            {editSectionName && (
              <button
                type='button'
                onClick={cancelEdit}
                className='text-sm text-richblack-300 underline hover:text-white transition'
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* NESTED VIEW */}
      <div className='mt-8'>
        <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
      </div>

      {/* FOOTER NAV */}
      <div className='flex justify-end gap-4 mt-10'>

        <button
          onClick={goBack}
          className='rounded-lg border border-richblack-600 px-5 py-2 text-richblack-200 hover:bg-richblack-700 transition-all duration-300'
        >
          Back
        </button>

        <Iconbtn
          text="Next"
          onclick={goToNext}
          customClasses={"bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-[1.05] transition-all duration-300"}
        >
          <BiRightArrow />
        </Iconbtn>

      </div>
    </div>
  )
}

export default CourseBuilderForm;
