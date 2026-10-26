import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import RenderSteps from '../AddCourse/RenderSteps';
import { getFullDetailsOfCourse, fetchCourseDetails } from '../../../../services/operations/courseDetailsAPI';
import { setEditCourse, setCourse, setStep } from '../../../../services/slices/courseSlice';

export default function EditCourse(){

    const dispatch = useDispatch()
    const { courseId } = useParams()
    const { course } = useSelector((state) => state.course)
    const [loading, setLoading] = useState(false)
    const { token } = useSelector((state) => state.auth)
  
    useEffect(() => {
      ;(async () => {
        setLoading(true)
        let result = await getFullDetailsOfCourse(courseId, token)
        let details = result?.courseDetails || result?.data?.courseDetails || result?.data || result
        if (!details || typeof details !== 'object' || (!details._id && !details.id && !details.courseName)) {
          const publicRes = await fetchCourseDetails(courseId)
          details = publicRes?.data?.courseDetails || publicRes?.data?.data || publicRes?.data || publicRes
        }

        const validCourse = details?.courseDetails || details
        if (validCourse && (validCourse._id || validCourse.id || validCourse.courseName)) {
          dispatch(setEditCourse(true))
          dispatch(setCourse(validCourse))
          dispatch(setStep(1))
        } else {
          dispatch(setCourse(null))
        }
        setLoading(false)
      })()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId])
  
    if (loading) {
      return (
        <div className="grid flex-1 place-items-center">
          <div className="spinner"></div>
        </div>
      )
    }
  
    return (
      <div>
        <h1 className="mb-14 text-3xl font-medium text-richblack-5">
          Edit Course
        </h1>
        <div className="mx-auto max-w-[600px]">
          {course ? (
            <RenderSteps />
          ) : (
            <p className="mt-14 text-center text-3xl font-semibold text-richblack-100">
              Course not found
            </p>
          )}
        </div>
      </div>
    )
  }
  