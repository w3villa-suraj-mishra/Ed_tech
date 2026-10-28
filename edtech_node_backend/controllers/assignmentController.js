const path = require('path');
const {
  Assignment,
  AssignmentQuestion,
  AssignmentResource,
  AssignmentSubmission,
  AssignmentSubmissionFile,
  Course,
  Enrollment,
  User,
  Profile
} = require('../models');
const { notificationService } = require('../services/notificationService');
const {
  isAllowedAssignmentFile,
  uploadAssignmentFiles,
  cleanupUploadedFiles,
  deleteLocalFile,
  getAccessibleFileUrl,
  formatFileRecord,
  formatSubmissionRecord,
  formatAssignmentRecord
} = require('../services/assignmentUploadService');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const ASSIGNMENT_INCLUDE = [
  { model: AssignmentQuestion, as: 'questions' },
  { model: AssignmentResource, as: 'resources' }
];

const SUBMISSION_FILE_INCLUDE = [
  { model: AssignmentSubmissionFile, as: 'files' }
];

const STUDENT_INCLUDE = [
  {
    model: User,
    as: 'student',
    attributes: ['id', 'firstName', 'lastName', 'email', 'image'],
    include: [{ model: Profile, as: 'profile', attributes: ['contactNumber'] }]
  }
];

const VERIFIER_INCLUDE = [
  {
    model: User,
    as: 'verifier',
    attributes: ['id', 'firstName', 'lastName', 'email']
  }
];

const isAdminUser = (user) => ['Admin', 'Superadmin'].includes(user?.accountType);

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseInteger = (value, fallback = null) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeStatus = (status, fallback = 'published') => (
  ['draft', 'published', 'closed'].includes(status) ? status : fallback
);

const getUploadedFiles = (req, fieldName) => {
  if (Array.isArray(req.files)) return req.files;
  return Array.isArray(req.files?.[fieldName]) ? req.files[fieldName] : [];
};

const parseQuestions = (value) => {
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((question, index) => ({
        questionText: String(question?.questionText || question?.text || '').trim(),
        marks: parseInteger(question?.marks, 0),
        order: parseInteger(question?.order, index)
      }))
      .filter((question) => question.questionText.length > 0);
  } catch (error) {
    return [];
  }
};

const findActiveEnrollment = async (userId, courseId) => {
  const enrollment = await Enrollment.findOne({
    where: { userId, courseId, status: 'active' }
  });

  if (!enrollment) return null;
  if (enrollment.expiresAt && new Date(enrollment.expiresAt).getTime() <= Date.now()) return null;
  return enrollment;
};

const getOwnedAssignment = async (assignmentId, user) => {
  const assignment = await Assignment.findByPk(assignmentId, {
    include: [{ model: Course, as: 'course' }]
  });

  if (!assignment) {
    const error = new Error('Assignment not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = String(assignment.course?.instructorId) === String(user.id);
  if (!isOwner && !isAdminUser(user)) {
    const error = new Error('You can only manage assignments for your own courses');
    error.statusCode = 403;
    throw error;
  }

  return assignment;
};

const validateUploadedFiles = (files = []) => {
  const invalidFile = files.find((file) => !isAllowedAssignmentFile(file));
  if (invalidFile) {
    const error = new Error('Only image and PDF files are allowed');
    error.statusCode = 400;
    throw error;
  }
};

const deleteStoredFile = (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
  const uploadsDir = path.join(__dirname, '../uploads');
  const filePath = path.join(uploadsDir, path.basename(fileUrl));
  deleteLocalFile(filePath);
};

const notifyEnrolledStudents = async (courseId, assignment) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { courseId, status: 'active' },
      attributes: ['userId', 'expiresAt']
    });

    const userIds = enrollments
      .filter((enrollment) => !enrollment.expiresAt || new Date(enrollment.expiresAt).getTime() > Date.now())
      .map((enrollment) => enrollment.userId);

    if (userIds.length === 0) return;

    await notificationService.notifyUsers(userIds, {
      type: 'ASSIGNMENT',
      source: 'ASSIGNMENT',
      title: 'New assignment available',
      message: `"${assignment.title}" has been posted in your course`,
      link: `/s/courses/${courseId}/take`,
      entityType: 'assignment',
      entityId: assignment.id
    });
  } catch (error) {
    logger.warn(`ASSIGNMENT NOTIFICATION FAILED: ${error.message}`);
  }
};

const notifyInstructor = async (assignment, submission, studentName) => {
  try {
    await notificationService.create({
      userId: assignment.instructorId,
      type: 'ASSIGNMENT_SUBMISSION',
      source: 'ASSIGNMENT',
      title: 'New assignment submission',
      message: `${studentName || 'A student'} submitted "${assignment.title}"`,
      link: '/dashboard/assignments',
      entityType: 'assignment_submission',
      entityId: submission.id
    });
  } catch (error) {
    logger.warn(`ASSIGNMENT SUBMISSION NOTIFICATION FAILED: ${error.message}`);
  }
};

const notifyStudentVerification = async (submission, assignment) => {
  try {
    const statusMessages = {
      verified: 'has been verified',
      resubmission_requested: 'needs to be resubmitted',
      rejected: 'was rejected'
    };

    await notificationService.create({
      userId: submission.userId,
      type: 'ASSIGNMENT_VERIFIED',
      source: 'ASSIGNMENT',
      title: 'Assignment reviewed',
      message: `"${assignment.title}" ${statusMessages[submission.status] || 'was reviewed'}`,
      link: `/s/courses/${assignment.courseId}/take`,
      entityType: 'assignment',
      entityId: assignment.id
    });
  } catch (error) {
    logger.warn(`ASSIGNMENT VERIFICATION NOTIFICATION FAILED: ${error.message}`);
  }
};

const handleControllerError = (res, error, fallbackMessage) => {
  logger.error(`${fallbackMessage}: ${error.message}`);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallbackMessage
  });
};

const createAssignment = async (req, res) => {
  const files = getUploadedFiles(req, 'resources');

  try {
    validateUploadedFiles(files);

    const courseId = parseInteger(req.body.courseId);
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course is required' });
    }

    const title = String(req.body.title || '').trim();
    if (!title) {
      return res.status(400).json({ success: false, message: 'Assignment title is required' });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (String(course.instructorId) !== String(req.user.id) && !isAdminUser(req.user)) {
      return res.status(403).json({ success: false, message: 'You can only create assignments for your own courses' });
    }

    const status = normalizeStatus(req.body.status, 'published');
    const assignment = await Assignment.create({
      courseId,
      instructorId: course.instructorId,
      title,
      description: req.body.description || null,
      instructions: req.body.instructions || null,
      dueAt: parseDate(req.body.dueAt),
      maxMarks: parseInteger(req.body.maxMarks, 100),
      allowResubmission: parseBoolean(req.body.allowResubmission, true),
      status
    });

    const questions = parseQuestions(req.body.questions);
    if (questions.length > 0) {
      await AssignmentQuestion.bulkCreate(questions.map((question) => ({
        ...question,
        assignmentId: assignment.id
      })));
    }

    const uploadedResources = await uploadAssignmentFiles(files);
    if (uploadedResources.length > 0) {
      await AssignmentResource.bulkCreate(uploadedResources.map((resource) => ({
        ...resource,
        assignmentId: assignment.id
      })));
    }

    if (status === 'published') {
      await notifyEnrolledStudents(courseId, assignment);
    }

    const created = await Assignment.findByPk(assignment.id, { include: ASSIGNMENT_INCLUDE });

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: formatAssignmentRecord(created)
    });
  } catch (error) {
    cleanupUploadedFiles(files);
    return handleControllerError(res, error, 'CREATE ASSIGNMENT FAILED');
  }
};

const getInstructorAssignments = async (req, res) => {
  try {
    const courseId = parseInteger(req.query.courseId);
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course is required' });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (String(course.instructorId) !== String(req.user.id) && !isAdminUser(req.user)) {
      return res.status(403).json({ success: false, message: 'You can only view assignments for your own courses' });
    }

    const assignments = await Assignment.findAll({
      where: { courseId },
      include: [
        ...ASSIGNMENT_INCLUDE,
        {
          model: AssignmentSubmission,
          as: 'submissions',
          attributes: ['id', 'userId', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const data = assignments.map((assignment) => {
      const formatted = formatAssignmentRecord(assignment);
      const submissions = formatted.submissions || [];
      delete formatted.submissions;
      return {
        ...formatted,
        submissionCount: submissions.length,
        gradedCount: submissions.filter((submission) => submission.status === 'verified').length,
        pendingCount: submissions.filter((submission) => ['submitted', 'under_review'].includes(submission.status)).length
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleControllerError(res, error, 'GET INSTRUCTOR ASSIGNMENTS FAILED');
  }
};

const getStudentAssignmentCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      attributes: ['courseId'],
      where: {
        userId: req.user.id,
        status: 'active',
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }]
      },
      raw: true
    });
    const courseIds = [...new Set(enrollments.map((enrollment) => Number(enrollment.courseId)))];

    if (courseIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const assignments = await Assignment.findAll({
      attributes: ['courseId'],
      where: { courseId: { [Op.in]: courseIds }, status: 'published' },
      include: [{ model: Course, as: 'course', attributes: ['id', 'courseName'], required: true }]
    });
    const courses = [...new Map(assignments
      .map((assignment) => assignment.course?.get({ plain: true }))
      .filter((course) => course?.id)
      .map((course) => [String(course.id), course])).values()];

    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    return handleControllerError(res, error, 'GET STUDENT ASSIGNMENT COURSES FAILED');
  }
};

const getCourseAssignments = async (req, res) => {
  try {
    const courseId = parseInteger(req.params.courseId);
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isOwner = String(course.instructorId) === String(req.user.id);
    const canManage = isOwner || isAdminUser(req.user);

    if (!canManage) {
      const enrollment = await findActiveEnrollment(req.user.id, courseId);
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Assignments are available only to enrolled students',
          notEnrolled: true
        });
      }
    }

    const where = canManage ? { courseId } : { courseId, status: { [require('sequelize').Op.in]: ['published', 'closed'] } };

    const assignments = await Assignment.findAll({
      where,
      include: [
        ...ASSIGNMENT_INCLUDE,
        {
          model: AssignmentSubmission,
          as: 'submissions',
          required: false,
          where: { userId: req.user.id },
          include: SUBMISSION_FILE_INCLUDE
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const data = assignments.map((assignment) => {
      const formatted = formatAssignmentRecord(assignment);
      const submissions = formatted.submissions || [];
      delete formatted.submissions;
      const mySubmission = submissions[0] || null;
      return {
        ...formatted,
        mySubmission: mySubmission ? formatSubmissionRecord(mySubmission) : null
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleControllerError(res, error, 'GET COURSE ASSIGNMENTS FAILED');
  }
};

const getAssignmentDetails = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.assignmentId, {
      include: [...ASSIGNMENT_INCLUDE, { model: Course, as: 'course' }]
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const isOwner = String(assignment.course?.instructorId) === String(req.user.id);
    const canManage = isOwner || isAdminUser(req.user);

    if (!canManage) {
      if (!['published', 'closed'].includes(assignment.status)) {
        return res.status(404).json({ success: false, message: 'Assignment not found' });
      }

      const enrollment = await findActiveEnrollment(req.user.id, assignment.courseId);
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Assignments are available only to enrolled students',
          notEnrolled: true
        });
      }
    }

    const submissionWhere = canManage ? { assignmentId: assignment.id } : { assignmentId: assignment.id, userId: req.user.id };
    const submissions = await AssignmentSubmission.findAll({
      where: submissionWhere,
      include: [...SUBMISSION_FILE_INCLUDE, ...STUDENT_INCLUDE, ...VERIFIER_INCLUDE],
      order: [['submittedAt', 'DESC']]
    });

    const formattedAssignment = formatAssignmentRecord(assignment);
    delete formattedAssignment.course;

    return res.status(200).json({
      success: true,
      data: {
        ...formattedAssignment,
        submissions: canManage ? submissions.map(formatSubmissionRecord) : [],
        mySubmission: canManage ? null : (submissions[0] ? formatSubmissionRecord(submissions[0]) : null)
      }
    });
  } catch (error) {
    return handleControllerError(res, error, 'GET ASSIGNMENT DETAILS FAILED');
  }
};

const updateAssignment = async (req, res) => {
  const files = getUploadedFiles(req, 'resources');

  try {
    validateUploadedFiles(files);

    const assignment = await getOwnedAssignment(req.params.assignmentId, req.user);
    const previousStatus = assignment.status;

    const updates = {};
    if (req.body.title !== undefined) {
      const title = String(req.body.title).trim();
      if (!title) {
        return res.status(400).json({ success: false, message: 'Assignment title cannot be empty' });
      }
      updates.title = title;
    }
    if (req.body.description !== undefined) updates.description = req.body.description || null;
    if (req.body.instructions !== undefined) updates.instructions = req.body.instructions || null;
    if (req.body.dueAt !== undefined) updates.dueAt = parseDate(req.body.dueAt);
    if (req.body.maxMarks !== undefined) updates.maxMarks = parseInteger(req.body.maxMarks, assignment.maxMarks);
    if (req.body.allowResubmission !== undefined) updates.allowResubmission = parseBoolean(req.body.allowResubmission, assignment.allowResubmission);
    if (req.body.status !== undefined) updates.status = normalizeStatus(req.body.status, assignment.status);

    await assignment.update(updates);

    if (req.body.questions !== undefined) {
      const questions = parseQuestions(req.body.questions);
      await AssignmentQuestion.destroy({ where: { assignmentId: assignment.id } });
      if (questions.length > 0) {
        await AssignmentQuestion.bulkCreate(questions.map((question) => ({
          ...question,
          assignmentId: assignment.id
        })));
      }
    }

    const uploadedResources = await uploadAssignmentFiles(files);
    if (uploadedResources.length > 0) {
      await AssignmentResource.bulkCreate(uploadedResources.map((resource) => ({
        ...resource,
        assignmentId: assignment.id
      })));
    }

    if (previousStatus !== 'published' && updates.status === 'published') {
      await notifyEnrolledStudents(assignment.courseId, assignment);
    }

    const updated = await Assignment.findByPk(assignment.id, { include: ASSIGNMENT_INCLUDE });

    return res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: formatAssignmentRecord(updated)
    });
  } catch (error) {
    cleanupUploadedFiles(files);
    return handleControllerError(res, error, 'UPDATE ASSIGNMENT FAILED');
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await getOwnedAssignment(req.params.assignmentId, req.user);
    const resources = await AssignmentResource.findAll({ where: { assignmentId: assignment.id } });
    const submissions = await AssignmentSubmission.findAll({
      where: { assignmentId: assignment.id },
      include: SUBMISSION_FILE_INCLUDE
    });

    await assignment.destroy();

    resources.forEach((resource) => deleteStoredFile(resource.fileUrl));
    submissions.forEach((submission) => {
      (submission.files || []).forEach((file) => deleteStoredFile(file.fileUrl));
    });

    return res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    return handleControllerError(res, error, 'DELETE ASSIGNMENT FAILED');
  }
};

const addQuestion = async (req, res) => {
  try {
    const assignment = await getOwnedAssignment(req.params.assignmentId, req.user);
    const questionText = String(req.body.questionText || '').trim();

    if (!questionText) {
      return res.status(400).json({ success: false, message: 'Question text is required' });
    }

    const question = await AssignmentQuestion.create({
      assignmentId: assignment.id,
      questionText,
      marks: parseInteger(req.body.marks, 0),
      order: parseInteger(req.body.order, 0)
    });

    return res.status(201).json({ success: true, message: 'Question added successfully', data: question });
  } catch (error) {
    return handleControllerError(res, error, 'ADD ASSIGNMENT QUESTION FAILED');
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await AssignmentQuestion.findByPk(req.params.questionId, {
      include: [{ model: Assignment, as: 'assignment', include: [{ model: Course, as: 'course' }] }]
    });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const isOwner = String(question.assignment?.course?.instructorId) === String(req.user.id);
    if (!isOwner && !isAdminUser(req.user)) {
      return res.status(403).json({ success: false, message: 'You can only manage questions for your own assignments' });
    }

    const updates = {};
    if (req.body.questionText !== undefined) {
      const questionText = String(req.body.questionText).trim();
      if (!questionText) {
        return res.status(400).json({ success: false, message: 'Question text cannot be empty' });
      }
      updates.questionText = questionText;
    }
    if (req.body.marks !== undefined) updates.marks = parseInteger(req.body.marks, question.marks);
    if (req.body.order !== undefined) updates.order = parseInteger(req.body.order, question.order);

    await question.update(updates);

    return res.status(200).json({ success: true, message: 'Question updated successfully', data: question });
  } catch (error) {
    return handleControllerError(res, error, 'UPDATE ASSIGNMENT QUESTION FAILED');
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await AssignmentQuestion.findByPk(req.params.questionId, {
      include: [{ model: Assignment, as: 'assignment', include: [{ model: Course, as: 'course' }] }]
    });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const isOwner = String(question.assignment?.course?.instructorId) === String(req.user.id);
    if (!isOwner && !isAdminUser(req.user)) {
      return res.status(403).json({ success: false, message: 'You can only manage questions for your own assignments' });
    }

    await question.destroy();

    return res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    return handleControllerError(res, error, 'DELETE ASSIGNMENT QUESTION FAILED');
  }
};

const addResources = async (req, res) => {
  const files = getUploadedFiles(req, 'resources');

  try {
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'Select at least one image or PDF file' });
    }

    validateUploadedFiles(files);

    const assignment = await getOwnedAssignment(req.params.assignmentId, req.user);
    const uploadedResources = await uploadAssignmentFiles(files);

    const resources = await AssignmentResource.bulkCreate(uploadedResources.map((resource) => ({
      ...resource,
      assignmentId: assignment.id
    })));

    return res.status(201).json({
      success: true,
      message: 'Resources uploaded successfully',
      data: resources.map(formatFileRecord)
    });
  } catch (error) {
    cleanupUploadedFiles(files);
    return handleControllerError(res, error, 'ADD ASSIGNMENT RESOURCES FAILED');
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await AssignmentResource.findByPk(req.params.resourceId, {
      include: [{ model: Assignment, as: 'assignment', include: [{ model: Course, as: 'course' }] }]
    });

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const isOwner = String(resource.assignment?.course?.instructorId) === String(req.user.id);
    if (!isOwner && !isAdminUser(req.user)) {
      return res.status(403).json({ success: false, message: 'You can only manage resources for your own assignments' });
    }

    const fileUrl = resource.fileUrl;
    await resource.destroy();
    deleteStoredFile(fileUrl);

    return res.status(200).json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    return handleControllerError(res, error, 'DELETE ASSIGNMENT RESOURCE FAILED');
  }
};

const getSubmissions = async (req, res) => {
  try {
    const assignment = await getOwnedAssignment(req.params.assignmentId, req.user);

    const submissions = await AssignmentSubmission.findAll({
      where: { assignmentId: assignment.id },
      include: [...SUBMISSION_FILE_INCLUDE, ...STUDENT_INCLUDE, ...VERIFIER_INCLUDE],
      order: [['submittedAt', 'DESC']]
    });

    return res.status(200).json({ success: true, data: submissions.map(formatSubmissionRecord) });
  } catch (error) {
    return handleControllerError(res, error, 'GET ASSIGNMENT SUBMISSIONS FAILED');
  }
};

const submitAssignment = async (req, res) => {
  const files = getUploadedFiles(req, 'files');

  try {
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'Upload at least one image or PDF file' });
    }

    validateUploadedFiles(files);

    const assignment = await Assignment.findByPk(req.params.assignmentId, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.status !== 'published') {
      return res.status(400).json({ success: false, message: 'This assignment is not accepting submissions' });
    }

    const enrollment = await findActiveEnrollment(req.user.id, assignment.courseId);
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Only enrolled students can submit this assignment',
        notEnrolled: true
      });
    }

    const existing = await AssignmentSubmission.findOne({
      where: { assignmentId: assignment.id, userId: req.user.id },
      include: SUBMISSION_FILE_INCLUDE
    });

    if (existing && !assignment.allowResubmission && ['submitted', 'under_review', 'verified'].includes(existing.status)) {
      return res.status(400).json({ success: false, message: 'You have already submitted this assignment' });
    }

    const isLate = Boolean(assignment.dueAt && new Date() > new Date(assignment.dueAt));

    let submission;
    if (existing) {
      submission = existing;
      await submission.update({
        status: 'submitted',
        note: req.body.note || null,
        marksAwarded: null,
        feedback: null,
        isLate,
        submittedAt: new Date(),
        verifiedAt: null,
        verifiedBy: null
      });

      await AssignmentSubmissionFile.destroy({ where: { submissionId: submission.id } });
      (existing.files || []).forEach((file) => deleteStoredFile(file.fileUrl));
    } else {
      submission = await AssignmentSubmission.create({
        assignmentId: assignment.id,
        userId: req.user.id,
        status: 'submitted',
        note: req.body.note || null,
        isLate,
        submittedAt: new Date()
      });
    }

    const uploadedFiles = await uploadAssignmentFiles(files);
    await AssignmentSubmissionFile.bulkCreate(uploadedFiles.map((file) => ({
      ...file,
      submissionId: submission.id
    })));

    const studentName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
    await notifyInstructor(assignment, submission, studentName);

    const created = await AssignmentSubmission.findByPk(submission.id, {
      include: SUBMISSION_FILE_INCLUDE
    });

    return res.status(existing ? 200 : 201).json({
      success: true,
      message: existing ? 'Assignment resubmitted successfully' : 'Assignment submitted successfully',
      data: formatSubmissionRecord(created)
    });
  } catch (error) {
    cleanupUploadedFiles(files);
    return handleControllerError(res, error, 'SUBMIT ASSIGNMENT FAILED');
  }
};

const getMySubmission = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const submission = await AssignmentSubmission.findOne({
      where: { assignmentId: assignment.id, userId: req.user.id },
      include: [...SUBMISSION_FILE_INCLUDE, ...VERIFIER_INCLUDE]
    });

    return res.status(200).json({ success: true, data: submission ? formatSubmissionRecord(submission) : null });
  } catch (error) {
    return handleControllerError(res, error, 'GET MY ASSIGNMENT SUBMISSION FAILED');
  }
};

const verifySubmission = async (req, res) => {
  try {
    const submission = await AssignmentSubmission.findByPk(req.params.submissionId, {
      include: [
        ...SUBMISSION_FILE_INCLUDE,
        { model: Assignment, as: 'assignment', include: [{ model: Course, as: 'course' }] }
      ]
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const isOwner = String(submission.assignment?.course?.instructorId) === String(req.user.id);
    if (!isOwner && !isAdminUser(req.user)) {
      return res.status(403).json({ success: false, message: 'You can only verify submissions for your own assignments' });
    }

    const status = req.body.status;
    if (!['verified', 'resubmission_requested', 'rejected', 'under_review'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid review status' });
    }

    const maxMarks = submission.assignment?.maxMarks || 100;
    let marksAwarded = null;

    if (status === 'verified') {
      marksAwarded = parseInteger(req.body.marksAwarded, null);
      if (marksAwarded === null) {
        return res.status(400).json({ success: false, message: 'Marks are required when verifying a submission' });
      }
      if (marksAwarded < 0 || marksAwarded > maxMarks) {
        return res.status(400).json({ success: false, message: `Marks must be between 0 and ${maxMarks}` });
      }
    }

    await submission.update({
      status,
      marksAwarded,
      feedback: req.body.feedback || null,
      verifiedAt: new Date(),
      verifiedBy: req.user.id
    });

    await notifyStudentVerification(submission, submission.assignment);

    const updated = await AssignmentSubmission.findByPk(submission.id, {
      include: [...SUBMISSION_FILE_INCLUDE, ...STUDENT_INCLUDE, ...VERIFIER_INCLUDE]
    });

    return res.status(200).json({
      success: true,
      message: 'Submission reviewed successfully',
      data: formatSubmissionRecord(updated)
    });
  } catch (error) {
    return handleControllerError(res, error, 'VERIFY ASSIGNMENT SUBMISSION FAILED');
  }
};

const downloadResource = async (req, res) => {
  try {
    const resource = await AssignmentResource.findByPk(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const accessibleUrl = getAccessibleFileUrl(resource.fileUrl);
    if (/^https?:\/\//i.test(accessibleUrl)) {
      return res.redirect(accessibleUrl);
    }

    const fs = require('fs');
    const filePath = path.join(__dirname, '../uploads', path.basename(accessibleUrl));
    if (fs.existsSync(filePath)) {
      return res.download(filePath, resource.fileName || path.basename(filePath));
    }

    return res.status(404).json({ success: false, message: 'Resource file not found' });
  } catch (error) {
    return handleControllerError(res, error, 'DOWNLOAD RESOURCE FAILED');
  }
};

const downloadSubmissionFile = async (req, res) => {
  try {
    const file = await AssignmentSubmissionFile.findByPk(req.params.fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Submission file not found' });
    }

    const accessibleUrl = getAccessibleFileUrl(file.fileUrl);
    if (/^https?:\/\//i.test(accessibleUrl)) {
      return res.redirect(accessibleUrl);
    }

    const fs = require('fs');
    const filePath = path.join(__dirname, '../uploads', path.basename(accessibleUrl));
    if (fs.existsSync(filePath)) {
      return res.download(filePath, file.fileName || path.basename(filePath));
    }

    return res.status(404).json({ success: false, message: 'Submission file not found' });
  } catch (error) {
    return handleControllerError(res, error, 'DOWNLOAD SUBMISSION FILE FAILED');
  }
};

module.exports = {
  createAssignment,
  getInstructorAssignments,
  getStudentAssignmentCourses,
  getCourseAssignments,
  getAssignmentDetails,
  updateAssignment,
  deleteAssignment,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addResources,
  deleteResource,
  getSubmissions,
  submitAssignment,
  getMySubmission,
  verifySubmission,
  downloadResource,
  downloadSubmissionFile
};
