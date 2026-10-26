import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import {  fetchInstructorCourses } from '../../../services/operations/courseDetailsAPI'
import { setCourse } from '../../../services/slices/courseSlice'
import Iconbtn from '../../Common/iconbtn'
import { FaPlus } from "react-icons/fa6";
import CoursesTable from "../Dashboard/InstructorCourses/CoursesTable"

const MyCourses = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      const result = await fetchInstructorCourses(token)
      if (result) {
        setCourses(result)
      }
      setLoading(false)
    }
    fetchCourses()
  }, [token])

  return (
    <div className="w-full font-['Inter',sans-serif] space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage your enrolled courses, track your progress, and continue your learning journey.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/add-course')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <FaPlus size={13} />
          <span>Add Course</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <CoursesTable courses={courses} setCourses={setCourses} />
      )}
    </div>
  );
};

export default MyCourses;
