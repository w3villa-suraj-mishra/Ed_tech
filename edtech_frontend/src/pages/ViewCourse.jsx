import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { courseEndpoints } from '../services/apis';
import {
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
  setCompletedLectures,
} from '../services/slices/viewCourseSlice';
import VideoDetailsSidebar from '../components/core/ViewCourse/VideoDetailsSidebar';

const { COURSE_DETAILS_API } = courseEndpoints;

const ViewCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [reviewModal, setReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setCourseSpecificDetails = async () => {
      setLoading(true);
      try {
        const res = await apiConnector('GET', `${COURSE_DETAILS_API}?courseId=${courseId}`, null, {
          Authorization: `Bearer ${token}`,
        });

        if (res?.data?.success) {
          const courseData = res.data.data;
          dispatch(setEntireCourseData(courseData));
          dispatch(setCourseSectionData(courseData.courseContent));

          const totalLectures = courseData.courseContent?.reduce(
            (acc, sec) => acc + (sec.subSection?.length || 0), 0
          );
          dispatch(setTotalNoOfLectures(totalLectures));

          // Normalize IDs to strings so they match URL params (which are always strings)
          dispatch(setCompletedLectures((courseData.completedVideos || []).map(String)));

          // Auto-navigate to first lecture if no sub-section in URL
          if (!window.location.pathname.includes('sub-section')) {
            const firstSection = courseData.courseContent?.[0];
            const firstLecture = firstSection?.subSection?.[0];
            if (firstSection && firstLecture) {
              navigate(
                `/view-course/${courseId}/section/${firstSection._id}/sub-section/${firstLecture._id}`,
                { replace: true }
              );
            }
          }
        }
      } catch (err) {
        console.error('ViewCourse load error:', err);
      }
      setLoading(false);
    };

    if (courseId) setCourseSpecificDetails();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex h-[85vh] items-center justify-center bg-richblack-900">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-richblack-900 font-['Inter']">
      {/* LEFT: VIDEO PLAYER */}
      <div className="flex-1 overflow-y-auto">
        <Outlet context={{ setReviewModal }} />
      </div>

      {/* RIGHT: SIDEBAR */}
      <div className="w-[380px] shrink-0 border-l border-richblack-700 overflow-y-auto bg-richblack-800 hidden lg:block">
        <VideoDetailsSidebar setReviewModal={setReviewModal} />
      </div>
    </div>
  );
};

export default ViewCourse;
