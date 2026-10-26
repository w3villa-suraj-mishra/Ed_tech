export const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000"

// AUTH ENDPOINTS
export const endpoints = {
  SITE_CONFIG_API: BASE_URL + "/config",
  SENDOTP_API: BASE_URL + "/send_otp",
  VERIFYOTP_API: BASE_URL + "/verify_otp",
  SIGNUP_API: BASE_URL + "/signup",
  LOGIN_API: BASE_URL + "/login",
  LOGOUT_API: BASE_URL + "/logout",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API:BASE_URL+"/profile/instructorDashboard"
}

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/payment/sendPaymentSuccessEmail",
  PURCHASE_HISTORY_API: "/api/v1/payment/getPurchaseHistory",
}


// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/showAllCategories",
  CREATE_COURSE_API: BASE_URL + "/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: BASE_URL + "/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED:
    BASE_URL + "/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/course/updateCourseProgress",
  UPDATE_LECTURE_DURATION_API: BASE_URL + "/course/updateLectureDuration",
  CREATE_RATING_API: BASE_URL + "/course/createRating",
  UPDATE_COURSE_PRICING_API: BASE_URL + "/course",
  POST_COMMENT_API: BASE_URL + "/course/postComment",
  GET_COMMENTS_API: BASE_URL + "/course/getComments",
  DELETE_COMMENT_API: BASE_URL + "/course/deleteComment",
  GET_CERTIFICATE_API: BASE_URL + "/course/getCertificate",
  VERIFY_CERTIFICATE_API: BASE_URL + "/certificate/verify",
  GET_HOMEPAGE_STATS_API: BASE_URL + "/course/getHomePageStats",
  VALIDATE_OFFER_API: BASE_URL + "/offers/validate",
}

// NOTIFICATIONS ENDPOINTS
export const notificationEndpoints = {
  GET_NOTIFICATIONS_API: BASE_URL + "/notifications",
  GET_UNREAD_COUNT_API: BASE_URL + "/notifications/unread-count",
  MARK_READ_API: BASE_URL + "/notifications",
  MARK_ALL_READ_API: BASE_URL + "/notifications/read-all",
  DELETE_NOTIFICATION_API: BASE_URL + "/notifications",
  PREFERENCES_API: BASE_URL + "/notifications/preferences",
  ADMIN_CREATE_NOTIFICATION_API: BASE_URL + "/admin/create-notification",
}

// ARTICLE ENDPOINTS
export const articleEndpoints = {
  GET_ALL_ARTICLES_API: BASE_URL + "/articles",
  GET_ADMIN_ARTICLES_API: BASE_URL + "/admin/articles",
  CREATE_ARTICLE_API: BASE_URL + "/admin/articles",
  UPDATE_ARTICLE_API: BASE_URL + "/admin/articles",
  DELETE_ARTICLE_API: BASE_URL + "/admin/articles",
}

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/course/getReviews",
}

// CATAGORIES API
export const categories = {
  CATEGORIES_API: BASE_URL + "/course/showAllCategories",
}

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/course/getCategoryPageDetails",
}
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/reach/contact",
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateDisplayPicture",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteAccount",
}

// PRACTICE ENDPOINTS
export const practiceEndpoints = {
  GET_PRACTICE_OVERVIEW: BASE_URL + "/practice/overview",
  GET_DAILY_QUIZ: BASE_URL + "/practice/daily-quiz",
  GET_TOPIC_QUESTIONS: BASE_URL + "/practice/topic-questions",
  GET_PRACTICE_TESTS: BASE_URL + "/practice/tests",
  SUBMIT_ATTEMPT: BASE_URL + "/practice/submit",
  RUN_CODE_API: BASE_URL + "/practice/code/run",
  GET_USER_ATTEMPTS: BASE_URL + "/practice/attempts",
  GET_ATTEMPT_DETAILS: BASE_URL + "/practice/attempts/",
  GET_PRACTICE_CATEGORIES: BASE_URL + "/practice/categories",
  ADMIN_QUESTIONS: BASE_URL + "/admin/practice/questions",
  ADMIN_BULK_DELETE_QUESTIONS: BASE_URL + "/admin/practice/questions/bulk-delete",
  ADMIN_BULK_QUESTIONS: BASE_URL + "/admin/practice/questions/bulk",
  ADMIN_TESTS: BASE_URL + "/admin/practice/tests",
  ADMIN_BULK_DELETE_TESTS: BASE_URL + "/admin/practice/tests/bulk-delete",
  ADMIN_CATEGORIES: BASE_URL + "/admin/practice/categories",
  ADMIN_TOPICS: BASE_URL + "/admin/practice/topics",
  GET_COURSE_PRACTICE: BASE_URL + "/practice/course",
  INSTRUCTOR_CREATE_COURSE_TEST: BASE_URL + "/instructor/practice/course-test",
  INSTRUCTOR_GET_TESTS: BASE_URL + "/instructor/practice/tests",
  INSTRUCTOR_GET_QUESTIONS: BASE_URL + "/instructor/practice/questions",
  INSTRUCTOR_TOGGLE_TEST_STATUS: BASE_URL + "/instructor/practice/tests/",
  INSTRUCTOR_GET_TEST_ATTEMPTS: BASE_URL + "/instructor/practice/tests/",
}

// ANNOUNCEMENT ENDPOINTS
export const announcementEndpoints = {
  GET_ACTIVE_ANNOUNCEMENT_API: BASE_URL + "/announcements/active",
  DISMISS_ANNOUNCEMENT_API: BASE_URL + "/announcements",
  ADMIN_ANNOUNCEMENTS_API: BASE_URL + "/admin/announcements"
}