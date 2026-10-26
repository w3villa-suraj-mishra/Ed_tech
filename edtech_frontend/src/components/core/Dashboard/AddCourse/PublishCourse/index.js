import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Iconbtn from '../../../../Common/iconbtn'
import { resetCourseState, setStep } from '../../../../../services/slices/courseSlice'
import { COURSE_STATUS } from '../../../../../utils/constants'
import { editCourseDetails } from '../../../../../services/operations/courseDetailsAPI'

const PublishCourse = () => {
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
      } = useForm()
    
      const dispatch = useDispatch()
      const navigate = useNavigate()
      const { token } = useSelector((state) => state.auth)
      const { course } = useSelector((state) => state.course)
      const [loading, setLoading] = useState(false)
      
          useEffect(()=>{
            if(course?.status===COURSE_STATUS.PUBLISHED){
                setValue("public",true)
            }
          },[])

      const goBack = ()=>{
        dispatch(setStep(2))

      }

      const goToCourses = () => {
        dispatch(resetCourseState());
        navigate("/dashboard/my-courses");
      }

      const handleCoursePublish = async()=>{
        if(course?.status===COURSE_STATUS.PUBLISHED && getValues("public") === true ||
    (course.status===COURSE_STATUS.DRAFT&& getValues("public")===false)){
        // no updataion inform
        // no need to call api
        goToCourses();
        return;
    }

    // if form update
      const formData = new FormData();
      formData.append("courseId",course._id);
      const courseStatus = getValues("public")?COURSE_STATUS.PUBLISHED:COURSE_STATUS.DRAFT;
      formData.append("status",courseStatus);

      setLoading(true);
      const result  = await editCourseDetails(formData,token);

      if(result){
        goToCourses();
      }

      }

      const onSubmit =()=>{
        handleCoursePublish();

      }

  return (
    <div className='rounded-md border-[1px] bg-richblack-800 p-6 border-richblack-700 text-white '>
         <p>Publish Course</p>
         <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor='public'>
                  <input
                  type='checkbox'
                  id='public'
                  {...register("public")}
                  className='rounded h-4 w-4'
                  />
                <span className='ml-3'>Make this Course as Public</span>
               </label>
            
            </div>
            <div className='flex justify-end gap-x-3'>
                <button
                disabled={loading}
                type='button'
                onClick={goBack}
                className='flex items-center rounded-md bg-richblack-300 p-4 '
                >
                    Back

                </button>
                <Iconbtn disabled={loading} text="save change"/>
            </div>
         </form>
     </div>
  )
}

export default PublishCourse
