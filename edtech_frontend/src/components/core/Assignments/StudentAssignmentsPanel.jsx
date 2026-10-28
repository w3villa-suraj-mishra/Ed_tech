import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiImage,
  FiPaperclip,
  FiRefreshCw,
  FiUpload,
  FiX,
} from "react-icons/fi";
import {
  getAssignmentDetailsAPI,
  getCourseAssignmentsAPI,
  resolveAssignmentFileUrl,
  submitAssignmentAPI,
} from "../../../services/operations/assignmentAPI";

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

const isImageFile = (file) => (
  file?.fileType === "image" ||
  String(file?.mimeType || "").startsWith("image/") ||
  /\.(png|jpe?g|webp|gif)$/i.test(file?.fileName || file?.fileUrl || "")
);

const allowedSubmissionFile = (file) => (
  ["image/jpeg", "image/png", "image/webp", "application/pdf", "application/x-pdf"].includes(file.type)
);

const FilePreview = ({ file }) => {
  const url = resolveAssignmentFileUrl(file);

  if (!url) return null;

  if (isImageFile(file)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="group block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
      >
        <img
          src={url}
          alt={file.fileName || "Assignment attachment"}
          className="h-32 w-full object-cover transition group-hover:opacity-90"
        />
        <div className="flex items-center gap-2 px-3 py-2">
          <FiImage className="shrink-0 text-indigo-500" />
          <span className="truncate text-[11px] font-medium text-slate-600">
            {file.fileName || "Image"}
          </span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 transition hover:border-indigo-200 hover:bg-indigo-50"
    >
      <FiFileText className="shrink-0 text-rose-500" size={20} />
      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">
        {file.fileName || "PDF document"}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">
        PDF
      </span>
    </a>
  );
};

const StudentAssignmentsPanel = ({ courseId, onClose }) => {
  const { token } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAssignments = useCallback(async () => {
    if (!courseId || !token) {
      setAssignments([]);
      setLoading(false);
      setError(!token ? "Sign in to view course assignments." : "Course details are unavailable.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await getCourseAssignmentsAPI(courseId, token);
      setAssignments(result.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to load assignments");
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const openAssignment = async (assignment) => {
    const assignmentId = assignment.id || assignment._id;
    setActiveAssignment(assignment);
    setFiles([]);
    setNote("");
    setDetailLoading(true);
    try {
      const result = await getAssignmentDetailsAPI(assignmentId, token);
      setActiveAssignment(result.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Unable to load assignment");
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshActiveAssignment = async () => {
    if (!activeAssignment) return;
    const assignmentId = activeAssignment.id || activeAssignment._id;
    try {
      const result = await getAssignmentDetailsAPI(assignmentId, token);
      setActiveAssignment(result.data);
      await loadAssignments();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Unable to refresh assignment");
    }
  };

  const mySubmission = activeAssignment?.mySubmission || null;
  const canSubmit = Boolean(
    activeAssignment &&
    activeAssignment.status === "published" &&
    (
      !mySubmission ||
      activeAssignment.allowResubmission ||
      ["resubmission_requested", "rejected"].includes(mySubmission.status)
    )
  );

  const handleSubmit = async () => {
    if (!activeAssignment) return;
    if (files.length === 0) {
      toast.error("Select at least one image or PDF file");
      return;
    }
    if (files.length > 10 || files.some((file) => !allowedSubmissionFile(file))) {
      toast.error("Choose up to 10 JPG, PNG, WEBP, or PDF files");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      if (note.trim()) formData.append("note", note.trim());

      await submitAssignmentAPI(activeAssignment.id || activeAssignment._id, formData, token);
      toast.success(mySubmission ? "Assignment resubmitted" : "Assignment submitted");
      setFiles([]);
      setNote("");
      await refreshActiveAssignment();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Unable to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Assignments</h2>
            <p className="text-xs text-slate-500">
              Submit your work as images or PDF files and track instructor feedback.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
              >
                <FiArrowLeft size={14} /> Back to lesson
              </button>
            )}
            <button
              type="button"
              onClick={loadAssignments}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
            >
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <FiAlertCircle className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Could not load assignments</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <FiFileText className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="text-sm font-bold text-slate-700">No assignments yet</p>
            <p className="text-xs text-slate-500">Your instructor has not posted an assignment for this course.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => {
              const submission = assignment.mySubmission;
              const submissionStyle = submission ? submissionStatusStyles[submission.status] : "";
              return (
                <button
                  key={assignment.id || assignment._id}
                  type="button"
                  onClick={() => openAssignment(assignment)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-extrabold text-slate-900">
                          {assignment.title}
                        </h3>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${assignmentStatusStyles[assignment.status] || assignmentStatusStyles.closed}`}>
                          {assignment.status}
                        </span>
                        {submission && (
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${submissionStyle}`}>
                            {submissionStatusLabels[submission.status] || submission.status}
                          </span>
                        )}
                      </div>
                      {assignment.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {assignment.description}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-bold text-indigo-600">View</span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <FiCalendar size={13} /> Due {formatDate(assignment.dueAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiAward size={13} /> {assignment.maxMarks} marks
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiPaperclip size={13} /> {assignment.resources?.length || 0} resources
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiFileText size={13} /> {assignment.questions?.length || 0} questions
                    </span>
                    {submission?.marksAwarded !== null && submission?.marksAwarded !== undefined && (
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <FiCheckCircle size={13} /> Score {submission.marksAwarded}/{assignment.maxMarks}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {activeAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-lg font-extrabold text-slate-900">
                    {activeAssignment.title}
                  </h3>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${assignmentStatusStyles[activeAssignment.status] || assignmentStatusStyles.closed}`}>
                    {activeAssignment.status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Due {formatDate(activeAssignment.dueAt)} · {activeAssignment.maxMarks} marks
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveAssignment(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close assignment"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              {detailLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                </div>
              ) : (
                <>
                  {activeAssignment.description && (
                    <section>
                      <h4 className="mb-1 text-xs font-extrabold uppercase tracking-wide text-slate-500">Description</h4>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                        {activeAssignment.description}
                      </p>
                    </section>
                  )}

                  {activeAssignment.instructions && (
                    <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <h4 className="mb-1 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-amber-700">
                        <FiAlertCircle /> Instructions
                      </h4>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-800">
                        {activeAssignment.instructions}
                      </p>
                    </section>
                  )}

                  <section>
                    <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">Questions</h4>
                    {activeAssignment.questions?.length ? (
                      <ol className="space-y-2">
                        {activeAssignment.questions.map((question, index) => (
                          <li key={question.id || index} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="whitespace-pre-wrap text-sm text-slate-700">{question.questionText}</p>
                              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                {question.marks} marks
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-xs text-slate-400">No questions were added to this assignment.</p>
                    )}
                  </section>

                  {activeAssignment.resources?.length > 0 && (
                    <section>
                      <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">Resources</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {activeAssignment.resources.map((resource) => (
                          <FilePreview key={resource.id || resource.fileUrl} file={resource} />
                        ))}
                      </div>
                    </section>
                  )}

                  {mySubmission && (
                    <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-extrabold text-slate-800">Your submission</h4>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${submissionStatusStyles[mySubmission.status]}`}>
                          {submissionStatusLabels[mySubmission.status] || mySubmission.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-[11px] font-medium text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <FiClock size={13} /> Submitted {formatDate(mySubmission.submittedAt)}
                        </span>
                        {mySubmission.isLate && (
                          <span className="flex items-center gap-1.5 text-orange-600">
                            <FiAlertCircle size={13} /> Late submission
                          </span>
                        )}
                        {mySubmission.marksAwarded !== null && mySubmission.marksAwarded !== undefined && (
                          <span className="flex items-center gap-1.5 text-emerald-600">
                            <FiAward size={13} /> {mySubmission.marksAwarded}/{activeAssignment.maxMarks}
                          </span>
                        )}
                      </div>

                      {mySubmission.note && (
                        <p className="rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-600">
                          {mySubmission.note}
                        </p>
                      )}

                      {mySubmission.feedback && (
                        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-700">Instructor feedback</p>
                          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-indigo-900">
                            {mySubmission.feedback}
                          </p>
                        </div>
                      )}

                      {mySubmission.files?.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {mySubmission.files.map((file) => (
                            <FilePreview key={file.id || file.fileUrl} file={file} />
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {canSubmit ? (
                    <section className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">
                          {mySubmission ? "Resubmit your work" : "Submit your work"}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Upload up to 10 images or PDF files. Accepted: JPG, PNG, WEBP, PDF.
                        </p>
                      </div>

                      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 bg-white px-4 py-6 text-center transition hover:border-indigo-500 hover:bg-indigo-50">
                        <FiUpload className="mb-2 text-indigo-500" size={22} />
                        <span className="text-xs font-bold text-indigo-700">
                          {files.length > 0 ? `${files.length} file(s) selected` : "Choose images or PDF files"}
                        </span>
                        <span className="text-[10px] text-slate-400">Click to browse</span>
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,.pdf,application/pdf,application/x-pdf"
                          className="hidden"
                          onChange={(event) => {
                            const selectedFiles = Array.from(event.target.files || []);
                            const validFiles = selectedFiles.filter(allowedSubmissionFile).slice(0, 10);
                            if (validFiles.length !== selectedFiles.length) {
                              toast.error("Choose up to 10 JPG, PNG, WEBP, or PDF files");
                            }
                            setFiles(validFiles);
                            event.target.value = "";
                          }}
                        />
                      </label>

                      {files.length > 0 && (
                        <div className="space-y-1.5">
                          {files.map((file) => (
                            <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <span className="min-w-0 truncate text-[11px] font-medium text-slate-600">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => setFiles((prev) => prev.filter((item) => item !== file))}
                                className="text-slate-400 transition hover:text-rose-600"
                                aria-label={`Remove ${file.name}`}
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <textarea
                        rows={3}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Optional note for your instructor"
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FiUpload size={14} />
                          {submitting ? "Submitting..." : mySubmission ? "Resubmit assignment" : "Submit assignment"}
                        </button>
                      </div>
                    </section>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                      {activeAssignment.status !== "published"
                        ? "This assignment is no longer accepting submissions."
                        : "This assignment has already been submitted and resubmission is not allowed."}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentsPanel;
