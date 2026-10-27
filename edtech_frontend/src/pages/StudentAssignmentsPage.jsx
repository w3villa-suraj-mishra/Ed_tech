import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FiAlertCircle, FiFileText, FiRefreshCw } from "react-icons/fi";
import StudentAssignmentsPanel from "../components/core/Assignments/StudentAssignmentsPanel";
import { getStudentAssignmentCoursesAPI } from "../services/operations/assignmentAPI";

const StudentAssignmentsPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = useCallback(async () => {
    if (!token) {
      setError("Sign in to view your assignments.");
      setCourses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await getStudentAssignmentCoursesAPI(token);
      const nextCourses = Array.isArray(result.data) ? result.data : [];
      setCourses(nextCourses);
      setSelectedCourseId((current) => (
        nextCourses.some((course) => String(course.id) === current)
          ? current
          : String(nextCourses[0]?.id || "")
      ));
    } catch (err) {
      setCourses([]);
      setSelectedCourseId("");
      setError(err?.response?.data?.message || err.message || "Unable to load your assignments.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Assignments</h1>
          <p className="mt-1 text-sm text-slate-500">View course assignments, submit your work, and check instructor feedback.</p>
        </div>
        <button
          type="button"
          onClick={loadCourses}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-60"
        >
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <div><p className="font-bold">Could not load assignments</p><p className="text-xs">{error}</p></div>
        </div>
      ) : loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FiFileText className="mx-auto mb-3 text-slate-300" size={40} />
          <p className="text-sm font-bold text-slate-700">No assignments yet</p>
          <p className="mt-1 text-xs text-slate-500">Published assignments for your enrolled courses will appear here.</p>
        </div>
      ) : (
        <>
          <label className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Course</span>
            <select
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
              className="min-w-[240px] flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.courseName}</option>
              ))}
            </select>
          </label>
          {selectedCourseId && <StudentAssignmentsPanel key={selectedCourseId} courseId={selectedCourseId} />}
        </>
      )}
    </div>
  );
};

export default StudentAssignmentsPage;
