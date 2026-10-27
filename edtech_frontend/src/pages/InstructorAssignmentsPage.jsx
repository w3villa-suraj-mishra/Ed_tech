import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiEye,
  FiFileText,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiSend,
  FiTrash2,
  FiUpload,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { apiConnector } from "../services/apiConnector";
import { courseEndpoints } from "../services/apis";
import {
  createAssignmentAPI,
  deleteAssignmentAPI,
  deleteAssignmentResourceAPI,
  getAssignmentSubmissionsAPI,
  getInstructorAssignmentsAPI,
  resolveAssignmentFileUrl,
  updateAssignmentAPI,
  verifyAssignmentSubmissionAPI,
} from "../services/operations/assignmentAPI";

const assignmentStatusStyles = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
};

const submissionStatusStyles = {
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  resubmission_requested: "bg-orange-50 text-orange-700 border-orange-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const submissionStatusLabels = {
  submitted: "Submitted",
  under_review: "Under review",
  verified: "Verified",
  resubmission_requested: "Resubmission requested",
  rejected: "Rejected",
};

const formatDate = (value) => {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

const isImageFile = (file) => (
  file?.fileType === "image" ||
  String(file?.mimeType || "").startsWith("image/") ||
  /\.(png|jpe?g|webp|gif)$/i.test(file?.fileName || file?.fileUrl || "")
);

const createQuestion = (marks = 10) => ({
  _key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  questionText: "",
  marks,
});

const createEmptyForm = () => ({
  title: "",
  description: "",
  instructions: "",
  dueAt: "",
  maxMarks: 100,
  allowResubmission: true,
  status: "published",
  questions: [createQuestion()],
});

const getStoredAuthToken = () => {
  if (typeof window === "undefined") return "";
  const storedToken = localStorage.getItem("token");
  if (!storedToken) return "";
  try {
    const parsedToken = JSON.parse(storedToken);
    return typeof parsedToken === "string" ? parsedToken : storedToken;
  } catch {
    return storedToken;
  }
};

const SubmissionFile = ({ file }) => {
  const url = resolveAssignmentFileUrl(file, "submissions");
  if (!url) return null;

  if (isImageFile(file)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
      >
        <img src={url} alt={file.fileName || "Submission"} className="h-24 w-full object-cover" />
        <p className="truncate px-2 py-1.5 text-[10px] font-medium text-slate-600">{file.fileName}</p>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition hover:border-indigo-200 hover:bg-indigo-50"
    >
      <FiFileText className="shrink-0 text-rose-500" />
      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-700">{file.fileName}</span>
    </a>
  );
};

const InstructorAssignmentsPage = () => {
  const { token } = useSelector((state) => state.auth);
  const authToken = token || getStoredAuthToken();

  const [courses, setCourses] = useState([]);
  const [courseLoadError, setCourseLoadError] = useState("");
  const [coursePage, setCoursePage] = useState(1);
  const [hasMoreCourses, setHasMoreCourses] = useState(false);
  const [loadingMoreCourses, setLoadingMoreCourses] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [form, setForm] = useState(createEmptyForm);
  const [resourceFiles, setResourceFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const [submissionsModal, setSubmissionsModal] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [review, setReview] = useState({ status: "verified", marksAwarded: "", feedback: "" });
  const [reviewSaving, setReviewSaving] = useState(false);

  const loadCourses = useCallback(async () => {
    setLoadingCourses(true);
    setCourseLoadError("");
    try {
      if (!authToken) {
        setCourses([]);
        setSelectedCourseId("");
        setCourseLoadError("Your session has expired. Sign in again to load your courses.");
        return;
      }

      const response = await apiConnector(
        "GET",
        courseEndpoints.GET_ALL_INSTRUCTOR_COURSES_API,
        null,
        { Authorization: `Bearer ${authToken}` },
        { status: "Published", page: 1, limit: 100 },
        { dedupe: false }
      );
      const payload = response.data?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.courses)
          ? payload.courses
          : [];
      setCourses(list);
      setCoursePage(response.data?.currentPage || 1);
      setHasMoreCourses(Boolean(response.data?.hasMore));
      const availableIds = list.map((course) => String(course._id || course.id));
      setSelectedCourseId((prev) => availableIds.includes(prev) ? prev : (availableIds[0] || ""));
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Unable to load your courses";
      setCourses([]);
      setSelectedCourseId("");
      setHasMoreCourses(false);
      setCourseLoadError(message);
      toast.error(message);
    } finally {
      setLoadingCourses(false);
    }
  }, [authToken]);

  const loadMoreCourses = useCallback(async () => {
    if (!authToken || !hasMoreCourses || loadingMoreCourses) return;
    setLoadingMoreCourses(true);
    try {
      const nextPage = coursePage + 1;
      const response = await apiConnector(
        "GET",
        courseEndpoints.GET_ALL_INSTRUCTOR_COURSES_API,
        null,
        { Authorization: `Bearer ${authToken}` },
        { status: "Published", page: nextPage, limit: 100 },
        { dedupe: false }
      );
      const payload = response.data?.data;
      const nextCourses = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.courses)
          ? payload.courses
          : [];
      setCourses((current) => [
        ...current,
        ...nextCourses.filter((course) => !current.some((existing) => String(existing.id || existing._id) === String(course.id || course._id)))
      ]);
      setCoursePage(response.data?.currentPage || nextPage);
      setHasMoreCourses(Boolean(response.data?.hasMore));
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Unable to load more courses";
      setCourseLoadError(message);
      toast.error(message);
    } finally {
      setLoadingMoreCourses(false);
    }
  }, [authToken, coursePage, hasMoreCourses, loadingMoreCourses]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const loadAssignments = useCallback(async () => {
    if (!authToken || !selectedCourseId) {
      setAssignments([]);
      return;
    }
    setLoadingAssignments(true);
    try {
      const result = await getInstructorAssignmentsAPI(selectedCourseId, authToken);
      setAssignments(result.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Unable to load assignments");
    } finally {
      setLoadingAssignments(false);
    }
  }, [selectedCourseId, authToken]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const openCreateForm = () => {
    setEditingAssignment(null);
    setForm(createEmptyForm());
    setResourceFiles([]);
    setIsFormOpen(true);
  };

  const openEditForm = (assignment) => {
    setEditingAssignment(assignment);
    setForm({
      title: assignment.title || "",
      description: assignment.description || "",
      instructions: assignment.instructions || "",
      dueAt: toDateTimeLocal(assignment.dueAt),
      maxMarks: assignment.maxMarks ?? 100,
      allowResubmission: Boolean(assignment.allowResubmission),
      status: assignment.status || "published",
      questions: assignment.questions?.length
        ? assignment.questions.map((question) => ({
            _key: `${question.id}-${Math.random().toString(36).slice(2)}`,
            questionText: question.questionText || "",
            marks: question.marks ?? 0,
          }))
        : [createQuestion()]
    });
    setResourceFiles([]);
    setIsFormOpen(true);
  };

  const updateQuestionField = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, questionIndex) => (
        questionIndex === index ? { ...question, [field]: value } : question
      ))
    }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => {
      const questions = prev.questions.filter((_, questionIndex) => questionIndex !== index);
      return { ...prev, questions: questions.length ? questions : [createQuestion()] };
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!selectedCourseId) {
      toast.error("Select a course first");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Assignment title is required");
      return;
    }

    const questions = form.questions
      .map((question) => ({
        questionText: question.questionText.trim(),
        marks: Number(question.marks) || 0,
      }))
      .filter((question) => question.questionText);

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("courseId", selectedCourseId);
      formData.append("title", form.title.trim());
      formData.append("description", form.description);
      formData.append("instructions", form.instructions);
      formData.append("dueAt", form.dueAt ? new Date(form.dueAt).toISOString() : "");
      formData.append("maxMarks", Number(form.maxMarks) || 100);
      formData.append("allowResubmission", String(form.allowResubmission));
      formData.append("status", form.status);
      formData.append("questions", JSON.stringify(questions));
      resourceFiles.forEach((file) => formData.append("resources", file));

      if (editingAssignment) {
        await updateAssignmentAPI(editingAssignment.id, formData, authToken);
        toast.success("Assignment updated successfully");
      } else {
        await createAssignmentAPI(formData, authToken);
        toast.success("Assignment created successfully");
      }

      setIsFormOpen(false);
      setEditingAssignment(null);
      setResourceFiles([]);
      await loadAssignments();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Unable to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (assignment) => {
    if (!window.confirm(`Delete "${assignment.title}"? Student submissions will also be removed.`)) return;
    try {
      await deleteAssignmentAPI(assignment.id, authToken);
      toast.success("Assignment deleted");
      await loadAssignments();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Unable to delete assignment");
    }
  };

  const handleStatusChange = async (assignment, status) => {
    try {
      const formData = new FormData();
      formData.append("status", status);
      await updateAssignmentAPI(assignment.id, formData, authToken);
      toast.success(status === "published" ? "Assignment published" : "Assignment closed");
      await loadAssignments();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Unable to update assignment");
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Remove this resource?")) return;
    try {
      await deleteAssignmentResourceAPI(resourceId, authToken);
      setEditingAssignment((prev) => ({
        ...prev,
        resources: (prev.resources || []).filter((resource) => resource.id !== resourceId)
      }));
      await loadAssignments();
      toast.success("Resource removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Unable to remove resource");
    }
  };

  const loadSubmissions = async (assignment) => {
    setLoadingSubmissions(true);
    try {
      const result = await getAssignmentSubmissionsAPI(assignment.id, authToken);
      setSubmissions(result.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Unable to load submissions");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const openSubmissions = async (assignment) => {
    setSubmissionsModal(assignment);
    setSubmissions([]);
    setSelectedSubmission(null);
    await loadSubmissions(assignment);
  };

  const openReview = (submission) => {
    setSelectedSubmission(submission);
    setReview({
      status: submission.status === "under_review" ? "under_review" : "verified",
      marksAwarded: submission.marksAwarded ?? "",
      feedback: submission.feedback || "",
    });
  };

  const handleReviewSubmit = async () => {
    if (!selectedSubmission || !submissionsModal) return;

    if (review.status === "verified") {
      const marks = Number(review.marksAwarded);
      if (review.marksAwarded === "" || Number.isNaN(marks)) {
        toast.error("Enter marks before verifying");
        return;
      }
      if (marks < 0 || marks > Number(submissionsModal.maxMarks || 100)) {
        toast.error(`Marks must be between 0 and ${submissionsModal.maxMarks || 100}`);
        return;
      }
    }

    setReviewSaving(true);
    try {
      const payload = {
        status: review.status,
        feedback: review.feedback,
      };
      if (review.status === "verified") {
        payload.marksAwarded = Number(review.marksAwarded);
      }

      await verifyAssignmentSubmissionAPI(selectedSubmission.id, payload, authToken);
      toast.success("Submission reviewed");
      setSelectedSubmission(null);
      await loadSubmissions(submissionsModal);
      await loadAssignments();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Unable to review submission");
    } finally {
      setReviewSaving(false);
    }
  };

  const pendingCount = assignments.reduce((total, assignment) => total + (assignment.pendingCount || 0), 0);
  const submissionCount = assignments.reduce((total, assignment) => total + (assignment.submissionCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Assignments</h1>
            <p className="text-sm text-slate-500">
              Create assignments, attach resources, and review student submissions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAssignments}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
            >
              <FiRefreshCw size={14} /> Refresh
            </button>
            <button
              type="button"
              onClick={openCreateForm}
              disabled={!selectedCourseId}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiPlus size={15} /> New Assignment
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Assignments</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{assignments.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Submissions</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{submissionCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Pending review</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-600">{pendingCount}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Course</label>
          <select
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
            disabled={loadingCourses}
            className="min-w-[240px] flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            {loadingCourses ? (
              <option value="">Loading courses...</option>
            ) : courses.length === 0 ? (
              <option value="">{courseLoadError ? "Could not load courses" : "No courses available"}</option>
            ) : (
              courses.map((course) => (
                <option key={course._id || course.id} value={course._id || course.id}>
                  {course.courseName}
                </option>
              ))
            )}
          </select>
        </div>
        {hasMoreCourses && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={loadMoreCourses}
              disabled={loadingMoreCourses}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-wait disabled:opacity-60"
            >
              {loadingMoreCourses ? "Loading more..." : "Load more courses"}
            </button>
          </div>
        )}
        {courseLoadError && <p className="-mt-2 text-xs text-rose-600">{courseLoadError}</p>}

        {loadingAssignments ? (
          <div className="flex justify-center py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FiFileText className="mx-auto mb-3 text-slate-300" size={44} />
            <p className="text-sm font-bold text-slate-700">No assignments for this course</p>
            <p className="mt-1 text-xs text-slate-500">Create an assignment with questions and resources for your students.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-extrabold text-slate-900">{assignment.title}</h2>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${assignmentStatusStyles[assignment.status] || assignmentStatusStyles.closed}`}>
                        {assignment.status}
                      </span>
                    </div>
                    {assignment.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{assignment.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <FiCalendar size={13} /> Due {formatDate(assignment.dueAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiAward size={13} /> {assignment.maxMarks} marks
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiFileText size={13} /> {assignment.questions?.length || 0} questions
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiUpload size={13} /> {assignment.resources?.length || 0} resources
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiUsers size={13} /> {assignment.submissionCount || 0} submissions
                      </span>
                      {assignment.pendingCount > 0 && (
                        <span className="flex items-center gap-1.5 text-amber-600">
                          <FiClock size={13} /> {assignment.pendingCount} pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openSubmissions(assignment)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
                    >
                      <FiEye size={13} /> Submissions
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditForm(assignment)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
                    >
                      <FiEdit3 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(assignment, assignment.status === "published" ? "closed" : "published")}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
                    >
                      {assignment.status === "published" ? <FiX size={13} /> : <FiSend size={13} />}
                      {assignment.status === "published" ? "Close" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(assignment)}
                      className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100"
                    >
                      <FiTrash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="my-6 w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingAssignment ? "Edit assignment" : "Create assignment"}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close form"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Title</span>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="e.g. Build a REST API with Node.js"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Description</span>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="What should students complete?"
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Instructions</span>
                  <textarea
                    rows={2}
                    value={form.instructions}
                    onChange={(event) => setForm((prev) => ({ ...prev, instructions: event.target.value }))}
                    placeholder="Submission rules, formatting, or grading notes"
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <label>
                  <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>

                <label className="flex items-center gap-2 self-end rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={form.allowResubmission}
                    onChange={(event) => setForm((prev) => ({ ...prev, allowResubmission: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">Allow resubmission</span>
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Questions</h3>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, questions: [...prev.questions, createQuestion()] }))}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    <FiPlus size={13} /> Add question
                  </button>
                </div>

                {form.questions.map((question, index) => (
                  <div key={question._key} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_100px]">
                      <textarea
                        rows={2}
                        value={question.questionText}
                        onChange={(event) => updateQuestionField(index, "questionText", event.target.value)}
                        placeholder="Question text"
                        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                      <input
                        type="number"
                        min="0"
                        value={question.marks}
                        onChange={(event) => updateQuestionField(index, "marks", event.target.value)}
                        placeholder="Marks"
                        className="h-fit w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Remove question"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {editingAssignment?.resources?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Existing resources</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {editingAssignment.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        {isImageFile(resource) ? <FiImage className="shrink-0 text-indigo-500" /> : <FiFileText className="shrink-0 text-rose-500" />}
                        <a
                          href={resolveAssignmentFileUrl(resource)}
                          target="_blank"
                          rel="noreferrer"
                          className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-600 hover:text-indigo-600"
                        >
                          {resource.fileName}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(resource.id)}
                          className="text-slate-400 transition hover:text-rose-600"
                          aria-label="Remove resource"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
                <FiUpload className="mb-1 text-indigo-500" size={20} />
                <span className="text-xs font-bold text-slate-700">
                  {resourceFiles.length > 0 ? `${resourceFiles.length} new file(s) selected` : "Attach images or PDF resources"}
                </span>
                <span className="text-[10px] text-slate-400">Optional · images and PDFs only</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,application/pdf"
                  className="hidden"
                  onChange={(event) => setResourceFiles(Array.from(event.target.files || []))}
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiCheckCircle size={14} />
                {saving ? "Saving..." : editingAssignment ? "Save changes" : "Create assignment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {submissionsModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="my-6 w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Submissions</h2>
                <p className="text-xs text-slate-500">
                  {submissionsModal.title} · {submissions.length} submission(s)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmissionsModal(null);
                  setSelectedSubmission(null);
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close submissions"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">
              {loadingSubmissions ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <FiUsers className="mx-auto mb-2 text-slate-300" size={34} />
                  <p className="text-sm font-bold text-slate-600">No submissions yet</p>
                </div>
              ) : (
                submissions.map((submission) => {
                  const studentName = `${submission.student?.firstName || ""} ${submission.student?.lastName || ""}`.trim() || "Student";
                  const isSelected = selectedSubmission?.id === submission.id;
                  return (
                    <div
                      key={submission.id}
                      className={`rounded-2xl border p-4 transition ${isSelected ? "border-indigo-300 bg-indigo-50/40" : "border-slate-200 bg-white"}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {submission.student?.image ? (
                            <img src={submission.student.image} alt={studentName} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              {studentName[0] || "S"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-slate-900">{studentName}</p>
                            <p className="truncate text-[11px] text-slate-500">{submission.student?.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {submission.isLate && (
                            <span className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                              <FiAlertCircle size={11} /> Late
                            </span>
                          )}
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${submissionStatusStyles[submission.status]}`}>
                            {submissionStatusLabels[submission.status] || submission.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => openReview(submission)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-indigo-700"
                          >
                            Review
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-[11px] font-medium text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <FiClock size={12} /> {formatDate(submission.submittedAt)}
                        </span>
                        {submission.marksAwarded !== null && submission.marksAwarded !== undefined && (
                          <span className="flex items-center gap-1.5 text-emerald-600">
                            <FiAward size={12} /> {submission.marksAwarded}/{submissionsModal.maxMarks}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <FiFileText size={12} /> {submission.files?.length || 0} file(s)
                        </span>
                      </div>

                      {submission.note && (
                        <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600">
                          {submission.note}
                        </p>
                      )}

                      {submission.feedback && (
                        <p className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50 p-2.5 text-[11px] text-indigo-800">
                          <span className="font-bold">Feedback: </span>{submission.feedback}
                        </p>
                      )}

                      {submission.files?.length > 0 && (
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          {submission.files.map((file) => (
                            <SubmissionFile key={file.id || file.fileUrl} file={file} />
                          ))}
                        </div>
                      )}

                      {isSelected && (
                        <div className="mt-4 space-y-3 rounded-xl border border-indigo-200 bg-white p-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label>
                              <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Review status</span>
                              <select
                                value={review.status}
                                onChange={(event) => setReview((prev) => ({ ...prev, status: event.target.value }))}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400"
                              >
                                <option value="verified">Verified</option>
                                <option value="resubmission_requested">Request resubmission</option>
                                <option value="rejected">Rejected</option>
                                <option value="under_review">Under review</option>
                              </select>
                            </label>
                            {review.status === "verified" && (
                              <label>
                                <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Marks awarded</span>
                                <input
                                  type="number"
                                  min="0"
                                  max={submissionsModal.maxMarks}
                                  value={review.marksAwarded}
                                  onChange={(event) => setReview((prev) => ({ ...prev, marksAwarded: event.target.value }))}
                                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-400"
                                />
                              </label>
                            )}
                          </div>
                          <label>
                            <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Feedback</span>
                            <textarea
                              rows={3}
                              value={review.feedback}
                              onChange={(event) => setReview((prev) => ({ ...prev, feedback: event.target.value }))}
                              placeholder="Share feedback with the student"
                              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-400"
                            />
                          </label>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedSubmission(null)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleReviewSubmit}
                              disabled={reviewSaving}
                              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-[11px] font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                            >
                              {reviewSaving ? "Saving..." : "Save review"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorAssignmentsPage;
