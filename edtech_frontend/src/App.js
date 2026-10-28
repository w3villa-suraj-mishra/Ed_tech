import React, { useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Common/Footer.jsx";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import CategoriesPage from "./pages/CategoriesPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Signup from "./components/core/Auth/Signup.jsx";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import ScrollToTop from "./components/Common/ScrollToTop.jsx";
import LoginForm from "./components/core/Auth/LoginForm.jsx";
import ForgotPassword from "./components/core/Auth/ForgotPassword.jsx";
import ResetPassword from "./components/core/Auth/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Cart from "./components/core/Dashboard/Cart";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import Settings from "./components/core/Dashboard/Settings/Index";
import AddCourse from "./components/core/Dashboard/AddCourse";
import EditCourse from "./components/core/Dashboard/EditCourse";
import MyCourses from "./components/core/Dashboard/MyCourses";
import GlobalDashboard from "./components/core/Dashboard/GlobalDashboard";
import Articles from "./components/core/Dashboard/Articles";
import ArticleDetailPage from "./pages/ArticleDetailPage.jsx";
import GuidedPath from "./components/core/Dashboard/GuidedPath";
import HelpSupport from "./components/core/Dashboard/HelpSupport";
import NotificationSettings from "./components/core/Dashboard/NotificationSettings";
import CoursesPage from "./components/core/Dashboard/CoursesPage";
import ActiveCoursesPage from "./pages/ActiveCoursesPage.jsx";
import CourseTakePlayer from "./pages/CourseTakePlayer.jsx";
import CourseCertificatePage from "./pages/CourseCertificatePage.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import ViewCourse from "./pages/ViewCourse.jsx";
import CartPage from "./modules/cart/pages/CartPage";
import CheckoutPage from "./modules/checkout/pages/CheckoutPage";
import VideoDetails from "./components/core/ViewCourse/videoDetails.jsx";

import PracticeCenter from "./pages/PracticeCenter";
import PracticeTestsPage from "./pages/PracticeTestsPage";
import DailyQuiz from "./pages/DailyQuiz";
import TopicPractice from "./pages/TopicPractice";
import PreviousAttempts from "./pages/PreviousAttempts";
import InstructorPracticeBuilder from "./pages/InstructorPracticeBuilder";
import InstructorAssignmentsPage from "./pages/InstructorAssignmentsPage";
import StudentAssignmentsPage from "./pages/StudentAssignmentsPage";
import StudentCoursePracticePage from "./pages/StudentCoursePracticePage.jsx";
import StudentCourseTestRunner from "./pages/StudentCourseTestRunner.jsx";
import UpgradePlanPage from "./pages/UpgradePlanPage.jsx";
import LiveClassesPage from "./pages/LiveClassesPage.jsx";
import LiveClassroomPage from "./pages/LiveClassroomPage.jsx";
import NotFoundPage from "./pages/NotFoundPage";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails } from "./services/operations/profileAPI";
import { useNavigate } from "react-router-dom";

import AdminPracticeBank   from "./pages/admin/AdminPracticeBank";
import AdminPracticeTests  from "./pages/admin/AdminPracticeTests";
import AdminGlobalTests    from "./pages/admin/AdminGlobalTests";
import AdminCourseTests    from "./pages/admin/AdminCourseTests";

// Admin pages
import AdminIndex        from "./pages/admin/AdminIndex";
import AdminLogin        from "./pages/admin/AdminLogin";
import AdminSetup        from "./pages/admin/AdminSetup";
import AdminDashboard    from "./pages/admin/AdminDashboard";
import AdminUsers        from "./pages/admin/AdminUsers";
import AdminCourses      from "./pages/admin/AdminCourses";
import AdminCategories   from "./pages/admin/AdminCategories";
import AdminEnrollments  from "./pages/admin/AdminEnrollments";
import AdminReviews      from "./pages/admin/AdminReviews";
import AdminLiveSessions from "./pages/admin/AdminLiveSessions";
import AdminContacts     from "./pages/admin/AdminContacts";
import AdminArticles     from "./pages/admin/AdminArticles";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminInstructors from "./pages/admin/AdminInstructors";
import AnnouncementBanner from "./components/Common/AnnouncementBanner";
import { BASE_URL } from "./services/apis";

// Chat Module
import { AdminChatPage, StudentChatWidget } from "./modules/chat";

const OAuthCallbackForwarder = () => {
  const forwarding = useRef(false);

  useEffect(() => {
    if (forwarding.current) return;
    forwarding.current = true;

    const search = window.location.search;
    const backendHost = process.env.REACT_APP_BASE_URL || BASE_URL || 'https://ed-tech-backend-2kha.vercel.app';
    window.location.href = `${backendHost}/auth/google_oauth2/callback${search}`;
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-richblack-900">
      <p className="text-xl">Completing Google login, please wait...</p>
    </div>
  );
};

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (token && !user && !isAdminRoute) {
      dispatch(getUserDetails(token, navigate));
    }
  }, [token, user, isAdminRoute, dispatch, navigate]);

  // Admin routes render WITHOUT the public Navbar/Footer
  if (isAdminRoute) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ max: 1 }} />
        <Routes>
          <Route path="/admin"              element={<AdminIndex />} />
          <Route path="/admin/login"        element={<AdminLogin />} />
          <Route path="/admin/signup"       element={<AdminSetup />} />
          <Route path="/admin/dashboard"    element={<AdminDashboard />} />
          <Route path="/admin/conversations" element={<AdminChatPage />} />
          <Route path="/admin/users"        element={<AdminUsers />} />
          <Route path="/admin/courses"      element={<AdminCourses />} />
          <Route path="/admin/categories"   element={<AdminCategories />} />
          <Route path="/admin/enrollments"  element={<AdminEnrollments />} />
          <Route path="/admin/practice-bank" element={<AdminPracticeBank />} />
          <Route path="/admin/practice-tests" element={<AdminPracticeTests />} />
          <Route path="/admin/global-tests"  element={<AdminGlobalTests />} />
          <Route path="/admin/course-tests"  element={<AdminCourseTests />} />
          <Route path="/admin/reviews"      element={<AdminReviews />} />
          <Route path="/admin/articles"     element={<AdminArticles />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/offers"        element={<AdminOffers />} />
          <Route path="/admin/instructors"   element={<AdminInstructors />} />
          <Route path="/admin/live-sessions" element={<AdminLiveSessions />} />
          <Route path="/admin/contacts"     element={<AdminContacts />} />
        </Routes>
      </>
    );
  }

  const isPlayerRoute = location.pathname.startsWith("/s/courses") && !location.pathname.includes("/take/pratice-test");

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-[#111827] ${isPlayerRoute ? "h-screen overflow-hidden flex flex-col" : ""}`}>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{ max: 1 }} />
      {!location.pathname.startsWith("/t/u/activeCourses") &&
       !isPlayerRoute && (
        <>
          <AnnouncementBanner />
          <Navbar />
        </>
      )}
      <div className="main-content bg-[#F8FAFC]" style={{ flex: 1, minHeight: 0 }}>
        <Routes>
          <Route path="/"                     element={<Home />} />
          <Route path="/categories"           element={<CategoriesPage />} />
          <Route path="/all-categories"       element={<CategoriesPage />} />
          <Route path="/courses"              element={<Catalog />} />
          <Route path="/catalog"              element={<Catalog />} />
          <Route path="/catalog/:categoryId"  element={<Catalog />} />
          <Route path="/about"                element={<About />} />
          <Route path="/contact"              element={<Contact />} />
          <Route path="/login"                element={<LoginForm />} />
          <Route path="/forgot-password"      element={<ForgotPassword />} />
          <Route path="/reset-password"       element={<ResetPassword />} />
          <Route path="/signup"               element={<Signup />} />
          
          {/* Practice Center Routes */}
          <Route path="/practice"             element={<PracticeCenter />} />
          <Route path="/practice/tests"       element={<PracticeTestsPage />} />
          <Route path="/practice/coding"      element={<PracticeTestsPage defaultType="Coding" />} />
          <Route path="/practice/interview"   element={<PracticeTestsPage defaultType="Interview Test" />} />
          <Route path="/practice/mock-tests"  element={<PracticeTestsPage defaultType="Mock Test" />} />
          <Route path="/practice/daily-quiz"  element={<DailyQuiz />} />
          <Route path="/practice/topic"       element={<TopicPractice />} />
          <Route path="/practice/attempts"    element={<PreviousAttempts />} />
          <Route path="/practice/take/:testId" element={<StudentCourseTestRunner />} />

          <Route path="/cart"                 element={<CartPage />} />
          <Route path="/checkout"             element={<CheckoutPage />} />

          <Route path="/student-dashboard"    element={<StudentDashboard />} />
          <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
          <Route path="/dashboard"            element={<Dashboard />}>
            <Route index                      element={<GlobalDashboard />} />
            <Route path="global"              element={<GlobalDashboard />} />
            <Route path="my-profile"          element={<MyProfile />} />
            <Route path="cart"                element={<CartPage />} />
            <Route path="checkout font-sans text-white" element={<CheckoutPage />} />
            <Route path="checkout"            element={<CheckoutPage />} />
            <Route path="courses"             element={<CoursesPage defaultTab="your-courses" />} />
            <Route path="enrolled-courses"    element={<CoursesPage defaultTab="your-courses" />} />
            <Route path="buy-courses"         element={<CoursesPage defaultTab="buy-courses" />} />
            <Route path="practice"            element={<PracticeCenter />} />
            <Route path="practice/daily-quiz" element={<DailyQuiz />} />
            <Route path="practice/topic"      element={<TopicPractice />} />
            <Route path="practice/attempts"   element={<PreviousAttempts />} />
            <Route path="student-assignments" element={<StudentAssignmentsPage />} />
            <Route path="settings"            element={<Settings />} />
            <Route path="add-course"          element={<AddCourse />} />
            <Route path="edit-course/:courseId" element={<EditCourse />} />
            <Route path="my-courses"          element={<MyCourses />} />
            <Route path="instructor"          element={<InstructorDashboard />} />
            <Route path="instructor-practice" element={<InstructorPracticeBuilder />} />
             <Route path="assignments"          element={<InstructorAssignmentsPage />} />
             <Route path="live-classes"         element={<LiveClassesPage />} />
            <Route path="articles"            element={<Articles />} />
            <Route path="articles/:articleId" element={<ArticleDetailPage />} />
            <Route path="guided-path"         element={<GuidedPath />} />
            <Route path="notifications font-['Inter']" element={<NotificationSettings />} />
            <Route path="notifications"       element={<NotificationSettings />} />
            <Route path="help"                element={<HelpSupport />} />
          </Route>
          <Route path="/verify-otp"           element={<VerifyOtp />} />
          <Route path="/oauth-success"        element={<OAuthSuccess />} />
          <Route path="/auth/google_oauth2/callback" element={<OAuthCallbackForwarder />} />
          <Route path="/t/u/activeCourses"    element={<ActiveCoursesPage />} />
          <Route path="/s/courses/:courseId/take" element={<CourseTakePlayer />} />
          <Route path="/s/courses/:courseId/take/pratice-test" element={<StudentCoursePracticePage />} />
          <Route path="/s/courses/:courseId/take/pratice-test/:testId" element={<StudentCourseTestRunner />} />
          <Route path="/s/courses/:courseId/take/pratice-test/:testId/review/:attemptId" element={<StudentCourseTestRunner />} />
          <Route path="/courses/:courseId/take/pratice-test/:testId/review/:attemptId" element={<StudentCourseTestRunner />} />
          <Route path="/s/courses/:courseId/certificate" element={<CourseCertificatePage />} />
          <Route path="/certificate/verify/:certificateId" element={<CourseCertificatePage />} />
           <Route path="/upgrade"              element={<UpgradePlanPage />} />
           <Route path="/live/:classId"         element={<LiveClassroomPage />} />
          <Route path="/upgrade-plan"         element={<UpgradePlanPage />} />
          <Route path="/courses/:courseId/upgrade" element={<UpgradePlanPage />} />
          <Route path="/courses/:courseId"    element={<CourseDetails />} />
          <Route path="/view-course/:courseId" element={<ViewCourse />}>
            <Route
              path="section/:sectionId/sub-section/:subSectionId"
              element={<VideoDetails />}
            />
          </Route>
          <Route path="*"                     element={<NotFoundPage />} />
        </Routes>
      </div>
      <StudentChatWidget />
      {!location.pathname.startsWith("/t/u/activeCourses") &&
       !isPlayerRoute && <Footer />}
    </div>
  );
}

export default App;
