import { apiConnector } from "../apiConnector";
import { assignmentEndpoints, BASE_URL } from "../apis";

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

const unwrap = (response, fallbackMessage) => {
  if (response?.data?.success) {
    return response.data;
  }
  throw new Error(response?.data?.message || fallbackMessage);
};

export const resolveAssignmentFileUrl = (fileOrUrl, resourceType) => {
  const fileUrl = typeof fileOrUrl === "string" ? fileOrUrl : fileOrUrl?.fileUrl;
  const fileId = typeof fileOrUrl === "object" ? fileOrUrl?.id : null;

  if (!fileUrl) return "";

  // If it's a Cloudinary raw upload URL that may be blocked by default ACL, route through backend download endpoint if ID exists
  if (fileId && /res\.cloudinary\.com\/.*\/raw\/upload\//i.test(fileUrl) && !fileUrl.includes("api.cloudinary.com")) {
    const isSubmission = resourceType === "submissions" || Boolean(typeof fileOrUrl === "object" && fileOrUrl?.submissionId);
    const routePrefix = isSubmission ? "submissions/files" : "resources";
    return `${BASE_URL}/assignments/${routePrefix}/${fileId}/download`;
  }

  if (/^https?:\/\//i.test(fileUrl) || fileUrl.startsWith("data:")) return fileUrl;
  return `${BASE_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
};

export const createAssignmentAPI = async (formData, token) => {
  const response = await apiConnector(
    "POST",
    assignmentEndpoints.CREATE_ASSIGNMENT_API,
    formData,
    authHeaders(token)
  );
  return unwrap(response, "Unable to create assignment");
};

export const getInstructorAssignmentsAPI = async (courseId, token) => {
  const response = await apiConnector(
    "GET",
    `${assignmentEndpoints.INSTRUCTOR_ASSIGNMENTS_API}?courseId=${courseId}`,
    null,
    authHeaders(token)
  );
  return unwrap(response, "Unable to load assignments");
};

export const getStudentAssignmentCoursesAPI = async (token) => {
  const response = await apiConnector(
    "GET",
    assignmentEndpoints.STUDENT_ASSIGNMENT_COURSES_API,
    null,
    authHeaders(token)
  );
  return unwrap(response, "Unable to load your assignment courses");
};

export const getCourseAssignmentsAPI = async (courseId, token) => {
  const response = await apiConnector(
    "GET",
    `${assignmentEndpoints.COURSE_ASSIGNMENTS_API}/${courseId}`,
    null,
    authHeaders(token)
  );
  return unwrap(response, "Unable to load assignments");
};

export const getAssignmentDetailsAPI = async (assignmentId, token) => {
  const response = await apiConnector(
    "GET",
    `${assignmentEndpoints.ASSIGNMENT_DETAILS_API}/${assignmentId}`,
    null,
    authHeaders(token)
  );
  return unwrap(response, "Unable to load assignment");
};

export const updateAssignmentAPI = async (assignmentId, formData, token) => {
  const response = await apiConnector(
    "PUT",
    `${assignmentEndpoints.ASSIGNMENT_DETAILS_API}/${assignmentId}`,
    formData,
    authHeaders(token)
  );
  return unwrap(response, "Unable to update assignment");
};

export const deleteAssignmentAPI = async (assignmentId, token) => {
  const response = await apiConnector(
    "DELETE",
    `${assignmentEndpoints.ASSIGNMENT_DETAILS_API}/${assignmentId}`,
    null,
    authHeaders(token)
  );
  return unwrap(response, "Unable to delete assignment");
};

export const addAssignmentQuestionAPI = async (assignmentId, data, token) => {
  const response = await apiConnector(
    "POST",
    `${assignmentEndpoints.ASSIGNMENT_QUESTIONS_API}/${assignmentId}/questions`,
    data,
    authHeaders(token)
  );
  return unwrap(response, "Unable to add question");
};

export const updateAssignmentQuestionAPI = async (questionId, data, token) => {
  const response = await apiConnector(
    "PUT",
    `${assignmentEndpoints.ASSIGNMENT_QUESTIONS_API}/questions/${questionId}`,
    data,
    authHeaders(token)
  );
  return unwrap(response, "Unable to update question");
};

export const deleteAssignmentQuestionAPI = async (questionId, token) => {
  const response = await apiConnector(
    "DELETE",
    `${assignmentEndpoints.ASSIGNMENT_QUESTIONS_API}/questions/${questionId}`,
    null,
    authHeaders(token)
  );
  return unwrap(response, "Unable to delete question");
};

export const addAssignmentResourcesAPI = async (assignmentId, formData, token) => {
  const response = await apiConnector(
    "POST",
    `${assignmentEndpoints.ASSIGNMENT_RESOURCES_API}/${assignmentId}/resources`,
    formData,
    authHeaders(token)
  );
  return unwrap(response, "Unable to upload resources");
};

export const deleteAssignmentResourceAPI = async (resourceId, token) => {
  const response = await apiConnector(
    "DELETE",
    `${assignmentEndpoints.ASSIGNMENT_RESOURCES_API}/resources/${resourceId}`,
    null,
    authHeaders(token)
  );
  return unwrap(response, "Unable to delete resource");
};

export const getAssignmentSubmissionsAPI = async (assignmentId, token) => {
  const response = await apiConnector(
    "GET",
    `${assignmentEndpoints.ASSIGNMENT_SUBMISSIONS_API}/${assignmentId}/submissions`,
    null,
    authHeaders(token)
  );
  return unwrap(response, "Unable to load submissions");
};

export const submitAssignmentAPI = async (assignmentId, formData, token) => {
  const response = await apiConnector(
    "POST",
    `${assignmentEndpoints.SUBMIT_ASSIGNMENT_API}/${assignmentId}/submit`,
    formData,
    authHeaders(token)
  );
  return unwrap(response, "Unable to submit assignment");
};

export const getMyAssignmentSubmissionAPI = async (assignmentId, token) => {
  const response = await apiConnector(
    "GET",
    `${assignmentEndpoints.SUBMIT_ASSIGNMENT_API}/${assignmentId}/my-submission`,
    null,
    authHeaders(token)
  );
  return unwrap(response, "Unable to load your submission");
};

export const verifyAssignmentSubmissionAPI = async (submissionId, data, token) => {
  const response = await apiConnector(
    "PATCH",
    `${assignmentEndpoints.VERIFY_SUBMISSION_API}/${submissionId}/verify`,
    data,
    authHeaders(token)
  );
  return unwrap(response, "Unable to review submission");
};
