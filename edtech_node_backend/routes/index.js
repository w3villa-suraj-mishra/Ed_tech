const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const courseController = require('../controllers/courseController');
const sectionController = require('../controllers/sectionController');
const sessionsController = require('../controllers/sessionsController');
const paymentController = require('../controllers/paymentController');
const contactController = require('../controllers/contactController');
const notificationController = require('../controllers/notificationController');
const articleController = require('../controllers/articleController');
const logger = require('../utils/logger');
const { passport } = require('../config/passport');
const {
  authenticateUser,
  setCurrentUserIfAuthenticated,
  isInstructor,
  isAdmin
} = require('../middleware/auth');
const upload = require('../middleware/upload');
const assignmentController = require('../controllers/assignmentController');
const liveClassController = require('../controllers/liveClassController');

const assignmentUpload = (fields) => (req, res, next) => {
  upload.fields(fields)(req, res, (error) => {
    if (error) {
      return res.status(400).json({ success: false, message: error.message || 'File upload failed' });
    }
    next();
  });
};

const siteConfigController = require('../controllers/siteConfigController');
const announcementRoutes = require('./announcementRoutes');
const { chatRoutes } = require('../modules/chat');

// Chat client calls use the /api prefix; mount the chat module here so
// conversation and message endpoints are reachable through the main app.
router.use('/api', chatRoutes);

// ==========================================
// REFERRALS, REWARDS & WALLET MODULES
// ==========================================
const referralRoutes = require('../modules/referrals/routes/referral.routes');
const rewardRoutes = require('../modules/referrals/routes/reward.routes');
const walletRoutes = require('../modules/referrals/routes/wallet.routes');

router.use('/api', referralRoutes);
router.use('/api', rewardRoutes);
router.use('/api', walletRoutes);
router.use('/', referralRoutes); // Direct /referrals/... and /attribution/... paths
router.use('/', rewardRoutes);
router.use('/', walletRoutes);

// ==========================================
// SITE CONFIG ROUTES
// ==========================================
router.get('/config/:key', siteConfigController.getConfigByKey);

// ==========================================
// ANNOUNCEMENT ROUTES (PUBLIC / LEARNER)
// ==========================================
router.use('/announcements', announcementRoutes);

// ==========================================
// NOTIFICATION ROUTES
// ==========================================
router.get('/notifications', authenticateUser, notificationController.getUserNotifications);
router.get('/notifications/unread-count', authenticateUser, notificationController.getUnreadCount);
router.patch('/notifications/preferences', authenticateUser, notificationController.updatePreferences);
router.get('/notifications/preferences', authenticateUser, notificationController.getPreferences);
router.patch('/notifications/read-all', authenticateUser, notificationController.markAllAsRead);
router.patch('/notifications/:id/read', authenticateUser, notificationController.markAsRead);
router.delete('/notifications/:id', authenticateUser, notificationController.deleteNotification);
router.post('/admin/create-notification', authenticateUser, isAdmin, notificationController.createAdminNotification);

// ==========================================
// LIVE CLASS ROUTES
// ==========================================
router.post('/live-classes', authenticateUser, liveClassController.scheduleLiveClass);
router.get('/live-classes/instructor', authenticateUser, liveClassController.getInstructorLiveClasses);
router.get('/live-classes/student', authenticateUser, liveClassController.getStudentLiveClasses);
router.get('/courses/:courseId/live-classes', authenticateUser, liveClassController.getCourseLiveClasses);
router.get('/live-classes/:id', authenticateUser, liveClassController.getLiveClassDetails);
router.patch('/live-classes/:id', authenticateUser, liveClassController.updateLiveClass);
router.post('/live-classes/:id/cancel', authenticateUser, liveClassController.cancelLiveClass);
router.post('/live-classes/:id/start', authenticateUser, liveClassController.startLiveClass);
router.post('/live-classes/:id/end', authenticateUser, liveClassController.endLiveClass);
router.post('/live-classes/:id/join', authenticateUser, liveClassController.joinLiveClass);
router.post('/live-classes/:id/leave', authenticateUser, liveClassController.leaveLiveClass);
router.get('/live-classes/:id/attendance', authenticateUser, liveClassController.getAttendanceReport);

// ==========================================
// ARTICLE ROUTES
// ==========================================
router.get('/articles', articleController.getAllArticles);
router.get('/admin/articles', authenticateUser, isAdmin, articleController.getAdminArticles);
router.post('/admin/articles', authenticateUser, isAdmin, articleController.createArticle);
router.put('/admin/articles/:id', authenticateUser, isAdmin, articleController.updateArticle);
router.delete('/admin/articles/:id', authenticateUser, isAdmin, articleController.deleteArticle);

// ==========================================
// AUTH ROUTES
// ==========================================
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/send_otp', authController.sendOtp);
router.post('/verify_otp', authController.verifyOtp);
router.post('/auth/reset-password-token', authController.requestPasswordReset);
router.get('/auth/reset-password-token/:token', authController.verifyPasswordResetToken);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);
router.post('/auth/changepassword', authenticateUser, authController.changePassword);

// OAuth routes
router.get('/auth/debug', (req, res) => {
  return res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    googleCallback: process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/auth/google_oauth2/callback`,
    githubClientId: process.env.GITHUB_CLIENT_ID || null,
    githubCallback: process.env.GITHUB_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/auth/github/callback`,
    backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  });
});

router.get('/auth/github', (req, res, next) => {
  const mode = req.query.mode || 'signup';
  const role = req.query.role || 'Student';

  const githubClientId = String(process.env.GITHUB_CLIENT_ID || '').trim();
  const githubClientSecret = String(process.env.GITHUB_CLIENT_SECRET || '').trim();

  if (!githubClientId || !githubClientSecret) {
    return res.status(400).json({
      success: false,
      message: "GitHub OAuth is not configured on the server. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend Environment Variables."
    });
  }

  if (!passport._strategies?.github) {
    return res.status(500).json({
      success: false,
      message: "GitHub OAuth strategy is not initialized. Verify the server OAuth configuration."
    });
  }

  return passport.authenticate('github', {
    scope: ['user:email'],
    session: false,
    state: `${mode}_${role}`
  })(req, res, next);
});

router.get('/auth/google_oauth2', (req, res, next) => {
  const mode = req.query.mode || 'signup';
  const role = req.query.role || 'Student';

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(400).json({
      success: false,
      message: "Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend Environment Variables."
    });
  }

  const strategyExists = Boolean(passport._strategies && (passport._strategies['google_oauth2'] || passport._strategies['google']));

  if (!strategyExists) {
    return res.status(500).json({
      success: false,
      message: "Google OAuth strategy is not initialized. Verify the server OAuth configuration."
    });
  }

  const strategyName = passport._strategies['google_oauth2'] ? 'google_oauth2' : 'google';
  return passport.authenticate(strategyName, {
    scope: ['email', 'profile'],
    session: false,
    state: `${mode}_${role}`
  })(req, res, next);
});

router.get(
  '/auth/google_oauth2/callback',
  (req, res, next) => {
    if (!passport._strategies?.google_oauth2) {
      return res.status(500).json({ success: false, message: 'Google OAuth strategy is not initialized.' });
    }

    passport.authenticate('google_oauth2', { session: false }, (err, user, info) => {
      if (err) {
        logger.error('GOOGLE CALLBACK ERROR:', err.message);
        return res.redirect(`${(process.env.FRONTEND_URL || 'https://ed-tech-frontend-indol.vercel.app').trim()}/login?error=auth_failed`);
      }

      if (!user) {
        logger.error('GOOGLE CALLBACK: no user profile received', info);
        return res.redirect(`${(process.env.FRONTEND_URL || 'https://ed-tech-frontend-indol.vercel.app').trim()}/login?error=auth_failed`);
      }

      req.authInfo = user;
      req.user = user;

      if (req.query.state) {
        try {
          const statePayload = JSON.parse(req.query.state);
          req.query = { ...req.query, ...statePayload };
        } catch (e) {
          if (typeof req.query.state === 'string' && req.query.state.includes('_')) {
            const [mode, role] = req.query.state.split('_');
            req.query = { ...req.query, mode, role };
          }
        }
      }

      next();
    })(req, res, next);
  },
  sessionsController.create
);

router.get(
  '/auth/github/callback',
  (req, res, next) => {
    if (!passport._strategies?.github) {
      return res.redirect(`${(process.env.FRONTEND_URL || 'https://ed-tech-frontend-indol.vercel.app').trim()}/login?error=auth_failed`);
    }

    passport.authenticate('github', { session: false }, (err, user, info) => {
      const defaultFrontend = 'https://ed-tech-frontend-indol.vercel.app';
      const targetFrontend = (process.env.FRONTEND_URL || defaultFrontend).trim();

      if (err) {
        logger.error('[GITHUB CALLBACK ERROR]', err.message);
        return res.redirect(`${targetFrontend}/login?error=${encodeURIComponent(err.message)}`);
      }

      if (!user) {
        logger.error('[GITHUB CALLBACK ERROR] No GitHub profile received', info);
        return res.redirect(`${targetFrontend}/login?error=auth_failed`);
      }

      req.authInfo = user;
      req.user = user;

      if (req.query.state) {
        try {
          const statePayload = JSON.parse(req.query.state);
          req.query = { ...req.query, ...statePayload };
        } catch (e) {
          if (typeof req.query.state === 'string' && req.query.state.includes('_')) {
            const [mode, role] = req.query.state.split('_');
            req.query = { ...req.query, mode, role };
          }
        }
      }

      next();
    })(req, res, next);
  },
  sessionsController.create
);

router.get(
  '/auth/:provider/callback',
  (req, res, next) => {
    passport.authenticate(req.params.provider, { session: false }, (err, user) => {
      const defaultFrontend = 'https://ed-tech-frontend-indol.vercel.app';
      const targetFrontend = (process.env.FRONTEND_URL || defaultFrontend).trim();
      if (err || !user) {
        logger.error('OAuth provider callback error:', err ? err.message : 'No user profile');
        return res.redirect(`${targetFrontend}/login?error=auth_failed`);
      }
      req.authInfo = user;
      req.user = user;
      if (req.query.state) {
        try {
          const statePayload = JSON.parse(req.query.state);
          req.query = { ...req.query, ...statePayload };
        } catch (e) {
          if (typeof req.query.state === 'string' && req.query.state.includes('_')) {
            const [mode, role] = req.query.state.split('_');
            req.query = { ...req.query, mode, role };
          }
        }
      }
      next();
    })(req, res, next);
  },
  sessionsController.create
);
router.get('/github-start', sessionsController.githubStart);
router.get('/auth/failure', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
});

// ==========================================
// PROFILE ROUTES
// ==========================================
router.get(
  '/profile/getUserDetails',
  authenticateUser,
  profileController.getUserDetails
);
router.get(
  '/profile/getEnrolledCourses',
  authenticateUser,
  profileController.getEnrolledCourses
);
router.delete(
  '/profile/deleteAccount',
  authenticateUser,
  profileController.deleteAccount
);
router.get(
  '/profile/instructorDashboard',
  authenticateUser,
  isInstructor,
  profileController.instructorDashboard
);
router.put(
  '/profile/updateProfile',
  authenticateUser,
  profileController.updateProfile
);
router.put(
  '/profile/updateDisplayPicture',
  authenticateUser,
  upload.single('image'),
  profileController.updateDisplayPicture
);

// ==========================================
// COURSE ROUTES
// ==========================================
router.post(
  '/course/createCourse',
  authenticateUser,
  isInstructor,
  upload.single('thumbnailImage'),
  courseController.createCourse
);
router.post(
  '/course/editCourse',
  authenticateUser,
  isInstructor,
  upload.single('thumbnailImage'),
  courseController.editCourse
);
router.get(
  '/course/getInstructorCourses',
  authenticateUser,
  isInstructor,
  courseController.getInstructorCourses
);
router.patch(
  '/course/:id/pricing',
  authenticateUser,
  courseController.updateCoursePricing
);
router.get(
  '/course/:id/pricing',
  courseController.getCoursePricing
);
router.get(
  '/course/getHomePageStats',
  courseController.getHomePageStats
);
router.get(
  '/course/getAllCourses',
  setCurrentUserIfAuthenticated,
  courseController.getAllCourses
);
router.post(
  '/course/getCourseDetails',
  setCurrentUserIfAuthenticated,
  courseController.getCourseDetails
);
router.get(
  '/course/getCourseDetails',
  setCurrentUserIfAuthenticated,
  courseController.getCourseDetails
);
router.post(
  '/course/getFullCourseDetails',
  authenticateUser,
  courseController.getFullCourseDetails
);
router.get(
  '/course/showAllCategories',
  courseController.showAllCategories
);
router.post(
  '/course/createCategory',
  courseController.createCategory
);
router.post(
  '/course/createRating',
  authenticateUser,
  courseController.createRating
);
router.get(
  '/course/getReviews',
  courseController.getReviews
);
router.post(
  '/course/postComment',
  authenticateUser,
  courseController.postComment
);
router.get(
  '/course/getComments',
  courseController.getComments
);
router.delete(
  '/course/deleteComment',
  authenticateUser,
  courseController.deleteComment
);
router.get(
  '/course/getCertificate',
  authenticateUser,
  courseController.getCertificate
);
router.get(
  '/certificate/verify/:certificateId',
  courseController.verifyCertificate
);
router.get(
  '/course/getCategoryPageDetails',
  courseController.getCategoryPageDetails
);
router.delete(
  '/course/deleteCourse',
  authenticateUser,
  isInstructor,
  courseController.deleteCourse
);

// ==========================================
// SECTION ROUTES
// ==========================================
router.post(
  '/course/addSection',
  authenticateUser,
  isInstructor,
  sectionController.addSection
);
router.post(
  '/course/updateSection',
  authenticateUser,
  isInstructor,
  sectionController.updateSection
);
router.post(
  '/course/deleteSection',
  authenticateUser,
  isInstructor,
  sectionController.deleteSection
);

// ==========================================
// SUBSECTION ROUTES
// ==========================================
router.post(
  '/course/addSubSection',
  authenticateUser,
  isInstructor,
  upload.single('video'),
  sectionController.addSubSection
);
router.post(
  '/course/updateSubSection',
  authenticateUser,
  isInstructor,
  upload.single('videoFile'),
  sectionController.updateSubSection
);
router.post(
  '/course/updateLectureDuration',
  authenticateUser,
  courseController.updateLectureDuration
);
router.post(
  '/course/deleteSubSection',
  authenticateUser,
  isInstructor,
  sectionController.deleteSubSection
);

// ==========================================
// PROGRESS ROUTES
// ==========================================
router.post(
  '/course/updateCourseProgress',
  authenticateUser,
  sectionController.updateCourseProgress
);

// ==========================================
// OFFER / COUPON PUBLIC & STUDENT ROUTES
// ==========================================
const offerController = require('../controllers/offerController');
router.post('/offers/validate', setCurrentUserIfAuthenticated, offerController.validateAndCalculateCoupon);

// ==========================================
// PAYMENT ROUTES
// ==========================================
router.post('/payment/capturePayment', authenticateUser, paymentController.createPaymentOrder);
router.post('/payment/verifyPayment', authenticateUser, paymentController.verifyPayment);
router.post('/payment/sendPaymentSuccessEmail', authenticateUser, paymentController.sendPaymentSuccessEmail);
router.post('/payment/webhook', paymentController.handleWebhook);

// ==========================================
// CONTACT ROUTE
// ==========================================
router.post('/reach/contact', contactController.contact);

// ==========================================
// ASSIGNMENT ROUTES
// ==========================================
const assignmentResourceUpload = assignmentUpload([{ name: 'resources', maxCount: 10 }]);
const assignmentSubmissionUpload = assignmentUpload([{ name: 'files', maxCount: 10 }]);

router.post('/assignments/create', authenticateUser, isInstructor, assignmentResourceUpload, assignmentController.createAssignment);
router.get('/assignments/instructor', authenticateUser, isInstructor, assignmentController.getInstructorAssignments);
router.get('/assignments/student-courses', authenticateUser, assignmentController.getStudentAssignmentCourses);
router.get('/assignments/course/:courseId', authenticateUser, assignmentController.getCourseAssignments);
router.get('/assignments/:assignmentId', authenticateUser, assignmentController.getAssignmentDetails);
router.put('/assignments/:assignmentId', authenticateUser, isInstructor, assignmentResourceUpload, assignmentController.updateAssignment);
router.delete('/assignments/:assignmentId', authenticateUser, isInstructor, assignmentController.deleteAssignment);

router.post('/assignments/:assignmentId/questions', authenticateUser, isInstructor, assignmentController.addQuestion);
router.put('/assignments/questions/:questionId', authenticateUser, isInstructor, assignmentController.updateQuestion);
router.delete('/assignments/questions/:questionId', authenticateUser, isInstructor, assignmentController.deleteQuestion);

router.post('/assignments/:assignmentId/resources', authenticateUser, isInstructor, assignmentResourceUpload, assignmentController.addResources);
router.delete('/assignments/resources/:resourceId', authenticateUser, isInstructor, assignmentController.deleteResource);

router.get('/assignments/:assignmentId/submissions', authenticateUser, isInstructor, assignmentController.getSubmissions);
router.patch('/assignments/submissions/:submissionId/verify', authenticateUser, isInstructor, assignmentController.verifySubmission);

router.post('/assignments/:assignmentId/submit', authenticateUser, assignmentSubmissionUpload, assignmentController.submitAssignment);
router.get('/assignments/:assignmentId/my-submission', authenticateUser, assignmentController.getMySubmission);

// ==========================================
// PRACTICE ROUTES (Public Categories + Protected Practice Access)
// ==========================================
let practiceController;
try {
  practiceController = require('../controllers/practiceController');
} catch (err) {
  logger.error('[PRACTICE CONTROLLER LOAD ERROR]', err.message);
}

if (practiceController) {
  // Categories & Topics
  router.get('/practice/categories', practiceController.getCategories);
  router.post('/admin/practice/categories', authenticateUser, isAdmin, practiceController.createCategory);
  router.post('/admin/practice/topics', authenticateUser, isAdmin, practiceController.createTopic);

  // Question Bank
  router.get('/admin/practice/questions', authenticateUser, practiceController.getQuestions);
  router.post('/admin/practice/questions', authenticateUser, practiceController.createQuestion);
  router.post('/instructor/practice/questions', authenticateUser, isInstructor, practiceController.createQuestion);
  router.put('/admin/practice/questions/:id', authenticateUser, practiceController.updateQuestion);
  router.put('/instructor/practice/questions/:id', authenticateUser, isInstructor, practiceController.updateQuestion);
  router.delete('/admin/practice/questions/:id', authenticateUser, practiceController.deleteQuestion);
  router.post('/admin/practice/questions/bulk-delete', authenticateUser, practiceController.bulkDeleteQuestions);
  router.post('/admin/practice/questions/bulk', authenticateUser, isAdmin, practiceController.bulkUploadQuestions);

  // Test Builder (Admin)
  router.get('/admin/practice/tests', authenticateUser, isAdmin, practiceController.getTests);
  router.post('/admin/practice/tests', authenticateUser, isAdmin, practiceController.createTest);
  router.put('/admin/practice/tests/:id', authenticateUser, practiceController.updateTest);
  router.post('/admin/practice/tests/bulk-delete', authenticateUser, practiceController.bulkDeleteTests);
  router.delete('/admin/practice/tests/:id', authenticateUser, isAdmin, practiceController.deleteTest);

  // Student Practice Center (Requires Authentication, FREE for all logged-in users)
  router.get('/practice/overview', authenticateUser, practiceController.getPracticeOverview);
  router.get('/practice/daily-quiz', authenticateUser, practiceController.getDailyQuiz);
  router.get('/practice/topic-questions', authenticateUser, practiceController.getTopicPracticeQuestions);
  router.get('/practice/tests', authenticateUser, practiceController.getTests); // Student view published tests
  router.post('/practice/submit', authenticateUser, practiceController.submitAttempt);
  router.post('/practice/code/run', authenticateUser, practiceController.runCode);
  router.get('/practice/attempts', authenticateUser, practiceController.getUserAttempts);
  router.get('/practice/attempts/:id', authenticateUser, practiceController.getAttemptDetails);

  // Course-Specific Practice Endpoints
  router.get('/practice/course/:courseId', authenticateUser, practiceController.getCoursePractice);
  router.get('/instructor/practice/tests', authenticateUser, isInstructor, practiceController.getInstructorTests);
  router.get('/instructor/practice/questions', authenticateUser, isInstructor, practiceController.getInstructorQuestions);
  router.post('/instructor/practice/course-test', authenticateUser, isInstructor, practiceController.createInstructorCourseTest);
  router.put('/instructor/practice/tests/:id', authenticateUser, isInstructor, practiceController.updateTest);
  router.patch('/instructor/practice/tests/:id/status', authenticateUser, isInstructor, practiceController.updateTestStatus);
  router.get('/instructor/practice/tests/:testId/attempts', authenticateUser, isInstructor, practiceController.getTestAttempts);
}

module.exports = router;
