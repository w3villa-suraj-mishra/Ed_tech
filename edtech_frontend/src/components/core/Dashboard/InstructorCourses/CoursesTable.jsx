import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { COURSE_STATUS } from '../../../../utils/constants';
import { deleteCourse, fetchInstructorCourses } from '../../../../services/operations/courseDetailsAPI';
import ConfirmationModal from '../../../Common/ConfirmationModal';
import {
  FiEdit,
  FiTrash2,
  FiClock,
  FiFileText,
  FiBarChart2,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiSearch
} from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';

export default function CoursesTable({ courses, setCourses }) {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [loadingMoreCourses, setLoadingMoreCourses] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [courseSearch, setCourseSearch] = useState('');

  // Selection state
  const [selectedCourses, setSelectedCourses] = useState([]);

  // PAGINATION STATE:
  // Shows 6 courses per page as requested
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  // Active floating dropdown menu for 3-dots
  const [activeMenuCourseId, setActiveMenuCourseId] = useState(null);
  const menuRef = useRef(null);

  // Close 3-dots action menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuCourseId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Only show published courses in this user-facing course list.
  const allCourses = Array.from(new Map((courses || [])
    .filter((course) => course.status === 'Published' || course.status === COURSE_STATUS.PUBLISHED)
    .map((course) => ({
      ...course,
      id: course.id || course._id,
      duration: course.totalDuration || course.duration || null,
      sectionsCount: Number(course.sectionsCount ?? course.courseContent?.length ?? course.sections?.length ?? 0),
      price: Number(course.price ?? 0),
      status: course.status || 'Draft'
    }))
    .map((course) => [course.id || course._id, course])).values());

  const filteredCourses = allCourses.filter((course) => {
    const query = courseSearch.trim().toLocaleLowerCase();
    return !query || `${course.courseName || ''} ${course.courseDescription || ''}`.toLocaleLowerCase().includes(query);
  });

  useEffect(() => { setCurrentPage(1); }, [courseSearch]);

  // Pagination calculations
  const totalCourses = filteredCourses.length;
  const hasMoreCourses = Boolean(courses?.hasMore);
  const totalPages = Math.ceil(totalCourses / coursesPerPage) || 1;
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = Math.min(startIndex + coursesPerPage, totalCourses);
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  // Select or clear all courses matching the current search.
  const toggleSelectAll = (checked) => {
    const filteredIds = filteredCourses.map((course) => course.id || course._id);
    setSelectedCourses((selected) => checked
      ? [...new Set([...selected, ...filteredIds])]
      : selected.filter((id) => !filteredIds.includes(id)));
  };

  const toggleSelectCourse = (id) => {
    if (selectedCourses.includes(id)) {
      setSelectedCourses(selectedCourses.filter((item) => item !== id));
    } else {
      setSelectedCourses([...selectedCourses, id]);
    }
  };

  const handleCourseDelete = async (courseId) => {
    setLoading(true);
    if (courseId) {
      await deleteCourse({ courseId }, token);
    } else {
      for (const id of selectedCourses) {
        await deleteCourse({ courseId: id }, token);
      }
    }
    const result = await fetchInstructorCourses(token, { status: 'Published', page: 1, limit: 100 });
    if (result) {
      setCourses(result);
    }
    setConfirmationModal(null);
    setSelectedCourses([]);
    setLoading(false);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const loadMoreCourses = async () => {
    if (loadingMoreCourses || !hasMoreCourses) return;
    setLoadingMoreCourses(true);
    try {
      const nextPage = (Number(courses?.currentPage) || 1) + 1;
      const nextCourses = await fetchInstructorCourses(token, { status: 'Published', page: nextPage, limit: 100 });
      setCourses((current) => {
        const coursesById = new Map(current.map((course) => [course.id || course._id, course]));
        nextCourses.forEach((course) => coursesById.set(course.id || course._id, course));
        const combined = Array.from(coursesById.values());
        combined.currentPage = nextCourses.currentPage || nextPage;
        combined.hasMore = Boolean(nextCourses.hasMore);
        return combined;
      });
    } finally {
      setLoadingMoreCourses(false);
    }
  };

  return (
    <>
      {/* Course search and bulk actions */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-blue-400 focus-within:bg-white">
          <FiSearch className="shrink-0 text-slate-400" size={17} />
          <input
            type="search"
            value={courseSearch}
            onChange={(event) => setCourseSearch(event.target.value)}
            placeholder="Search your courses..."
            aria-label="Search your courses"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </label>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={filteredCourses.length > 0 && filteredCourses.every((course) => selectedCourses.includes(course.id || course._id))}
              onChange={(event) => toggleSelectAll(event.target.checked)}
              className="h-4 w-4 cursor-pointer rounded accent-blue-600"
            />
            Select matching
          </label>
          <button
            disabled={loading || selectedCourses.length === 0}
            onClick={() => {
              setConfirmationModal({
                text1: 'Delete Selected Courses?',
                text2: 'This will permanently remove the selected courses from your catalog.',
                btn1Text: !loading ? 'Delete All' : 'Deleting...',
                btn2Text: 'Cancel',
                btn1Handler: !loading ? () => handleCourseDelete() : () => {},
                btn2Handler: () => setConfirmationModal(null),
              });
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              selectedCourses.length > 0
                ? 'bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer'
                : 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <RiDeleteBin6Line size={14} />
            <span>Delete Selected ({selectedCourses.length})</span>
          </button>
        </div>
      </div>

      {/* 2. THREE-COLUMN CARDS GRID */}
      {totalCourses === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          {allCourses.length === 0 ? 'No published courses yet.' : 'No courses match your search.'}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {currentCourses.map((course) => {
          const courseId = course.id || course._id;
          const isSelected = selectedCourses.includes(courseId);
          const isPublished = course.status === 'Published' || course.status === COURSE_STATUS.PUBLISHED;

          return (
            <div
              key={courseId}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              {/* TOP THUMBNAIL AREA */}
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                <img
                  src={course.thumbnail || 'https://placehold.co/600x400/0f172a/94a3b8?text=Course'}
                  alt={course.courseName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x400/0f172a/94a3b8?text=Course+Thumbnail';
                  }}
                />

                {/* Overlaid Checkbox */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectCourse(courseId)}
                    className="w-4 h-4 rounded bg-white/90 border-slate-300 accent-blue-600 cursor-pointer shadow-sm"
                  />
                </div>

                {/* Overlaid Status Badge */}
                <div className="absolute top-3.5 right-3.5 z-10">
                  {isPublished ? (
                    <span className="bg-[#dcfce7] text-[#15803d] text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-[#bbf7d0] shadow-xs flex items-center gap-1">
                      Published
                    </span>
                  ) : (
                    <span className="bg-blue-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* CARD BODY CONTENT */}
              <div className="p-4 sm:p-5 flex flex-col gap-3.5 flex-1 justify-between">
                
                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3
                    onClick={() => navigate(`/dashboard/edit-course/${courseId}`)}
                    className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer"
                    title={course.courseName}
                  >
                    {course.courseName}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.courseDescription || 'No course description provided.'}
                  </p>
                </div>

                {/* Meta Row: Duration & Sections */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  {course.duration && <>
                    <div className="flex items-center gap-1">
                      <FiClock size={13} className="text-slate-400" />
                      <span>{course.duration}</span>
                    </div>
                    <span className="text-slate-300">|</span>
                  </>}
                  <div className="flex items-center gap-1">
                    <FiFileText size={13} className="text-slate-400" />
                    <span>{course.sectionsCount} Sections</span>
                  </div>
                </div>

                {/* Price & Rating */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-base sm:text-lg font-extrabold text-[#ea580c]">
                    ₹{Number(course.price || 0).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold">
                    <span className="text-amber-400 text-sm">★</span>
                    <span>{course.rating || '—'} ({course.reviewsCount || 0})</span>
                  </div>
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  
                  {/* Button 1: Analytics */}
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/instructor')}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FiBarChart2 size={14} className="text-slate-500" />
                    <span>Analytics</span>
                  </button>

                  {/* Row 2: Edit & 3-Dots Button */}
                  <div className="flex items-center gap-2">
                    
                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/edit-course/${courseId}`)}
                      className="flex-1 py-2.5 px-4 bg-[#f97316] hover:bg-[#ea580c] active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <FiEdit size={13} />
                      <span>Edit</span>
                    </button>

                    {/* 3-Dots Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuCourseId(activeMenuCourseId === courseId ? null : courseId);
                        }}
                        className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center transition cursor-pointer"
                        title="Options"
                      >
                        <FiMoreVertical size={16} />
                      </button>

                      {/* Dropdown Options */}
                      {activeMenuCourseId === courseId && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 bottom-12 z-30 w-44 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                        >
                          <button
                            onClick={() => {
                              setActiveMenuCourseId(null);
                              navigate(`/courses/${courseId}`);
                            }}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium text-left cursor-pointer"
                          >
                            <FiEye size={14} className="text-slate-500" />
                            <span>View Course</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuCourseId(null);
                              navigate(`/dashboard/edit-course/${courseId}`);
                            }}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium text-left cursor-pointer"
                          >
                            <FiEdit size={14} className="text-blue-600" />
                            <span>Edit Curriculum</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuCourseId(null);
                              setConfirmationModal({
                                text1: 'Delete Course?',
                                text2: 'This action cannot be undone.',
                                btn1Text: 'Delete',
                                btn2Text: 'Cancel',
                                btn1Handler: () => handleCourseDelete(courseId),
                                btn2Handler: () => setConfirmationModal(null),
                              });
                            }}
                            className="w-full px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium text-left cursor-pointer border-t border-slate-100 mt-1"
                          >
                            <FiTrash2 size={14} />
                            <span>Delete Course</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* 3. PAGINATION BAR MATCHING SCREENSHOT */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
        
        {/* Pagination Buttons: < 1 2 3 4 5 > */}
        <div className="flex items-center gap-1.5">
          
          {/* Previous Page Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            title="Previous Page"
          >
            <FiChevronLeft size={15} />
          </button>

          {/* Page numbers up to 5 */}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Page Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            title="Next Page"
          >
            <FiChevronRight size={15} />
          </button>
        </div>

        {/* Showing X-Y of Z courses Indicator */}
        <div className="text-slate-500 font-medium text-xs">
          Showing <strong className="text-slate-800">{startIndex + 1}-{endIndex}</strong> of{' '}
          <strong className="text-slate-800">{totalCourses}</strong> courses
        </div>
      </div>

      {hasMoreCourses && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={loadMoreCourses}
            disabled={loadingMoreCourses}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-wait disabled:opacity-60"
          >
            {loadingMoreCourses ? 'Loading courses…' : 'Load more courses'}
          </button>
        </div>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}
