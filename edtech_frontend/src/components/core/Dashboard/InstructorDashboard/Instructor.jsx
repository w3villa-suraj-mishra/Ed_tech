import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { fetchInstructorCourses } from '../../../../services/operations/courseDetailsAPI'
import { getInstructorData } from '../../../../services/operations/profileAPI'
import { Link } from 'react-router-dom'
import InstructorChart from './InstructorChart'

export default function Instructor() {
  const { token } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState(null)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    const getCourseDataWithStats = async () => {
      setLoading(true)
      const instructorApidata = await getInstructorData(token)
      const result = await fetchInstructorCourses(token, { page: 1, limit: 12 })

      if (instructorApidata?.length) setInstructorData(instructorApidata)
      if (result) setCourses(result)

      setLoading(false)
    }
    getCourseDataWithStats()
  }, [])

  const totalAmount = instructorData?.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0)
  const totalStudents = instructorData?.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0)

  return (
    <div className="space-y-8">

      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin h-12 w-12 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
        </div>
      ) : courses.length > 0 ? (

        <>
          {/* Stats + Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Chart */}
            <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 p-6 shadow-xl hover:shadow-2xl transition-all">
              {totalAmount > 0 || totalStudents > 0 ? (
                <InstructorChart courses={instructorData} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-lg font-semibold text-richblack-5">
                    📊 No Data Available
                  </p>
                  <p className="text-richblack-400 mt-2">
                    Start selling courses to see analytics
                  </p>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="flex flex-col gap-4">

              <div className="p-5 rounded-xl bg-richblack-800 border border-richblack-700 hover:scale-[1.03] transition-all shadow-lg">
                <p className="text-sm text-richblack-300">Total Courses</p>
                <p className="text-3xl font-bold text-yellow-400">{courses.length}</p>
              </div>

              <div className="p-5 rounded-xl bg-richblack-800 border border-richblack-700 hover:scale-[1.03] transition-all shadow-lg">
                <p className="text-sm text-richblack-300">Total Students</p>
                <p className="text-3xl font-bold text-blue-400">{totalStudents}</p>
              </div>

              <div className="p-5 rounded-xl bg-richblack-800 border border-richblack-700 hover:scale-[1.03] transition-all shadow-lg">
                <p className="text-sm text-richblack-300">Total Income</p>
                <p className="text-3xl font-bold text-green-400">₹ {totalAmount}</p>
              </div>

            </div>
          </div>

          {/* Courses Section */}
          <div className="rounded-2xl bg-richblack-800 p-6 shadow-xl">

            <div className="flex items-center justify-between mb-6">
              <p className="text-xl font-semibold text-richblack-5">
                🎓 Your Courses
              </p>
              <Link to="/dashboard/my-courses">
                <p className="text-sm text-yellow-400 hover:underline">
                  View All →
                </p>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {courses.slice(0, 3).map((course) => (
                <div
                  key={course._id}
                  className="rounded-xl overflow-hidden bg-richblack-900 border border-richblack-700 hover:scale-[1.03] transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-[180px] w-full object-cover"
                  />

                  <div className="p-4">
                    <p className="font-semibold text-richblack-5 line-clamp-1">
                      {course.courseName}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-xs text-richblack-300">
                      <span>{course.studentsEnrolled.length} students</span>
                      <span>₹ {course.price}</span>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </>

      ) : (
        <div className="flex flex-col items-center justify-center h-[400px] rounded-2xl bg-richblack-800 shadow-xl">

          <p className="text-2xl font-bold text-richblack-5">
            🚀 No Courses Yet
          </p>

          <p className="text-richblack-400 mt-2">
            Start your teaching journey today
          </p>

          <Link to="/dashboard/add-course">
            <button className="mt-6 px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:scale-105 transition-all">
              Create Course
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
