import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ContactDetails from "../components/ContactPage/ContactDetails";
import ContactForm from "../components/ContactPage/ContactForm";
import { getHomePageStats } from "../services/operations/courseDetailsAPI";
import { FaBookOpen, FaUsers, FaTools, FaQuestionCircle, FaTimes } from "react-icons/fa";
import { FiArrowRight, FiMessageSquare, FiHelpCircle } from "react-icons/fi";
import contactLeftDoodle from "../assests/Images/contact_left_doodle.png";
import contactRightDoodle from "../assests/Images/contact_right_doodle.png";
import contactCommunityIllustration from "../assests/Images/contact_community_illustration.png";

const faqCategories = [
  {
    id: "courses",
    icon: <FaBookOpen />,
    title: "Courses & Enrollments",
    desc: "Have questions about courses, enrollments or payments?",
    questions: [
      {
        q: "How do I enroll in a course?",
        a: "Browse the courses catalog, select your desired course, click 'Buy Now' or 'Enroll', and complete the checkout process."
      },
      {
        q: "Are the courses self-paced or live?",
        a: "Our platform offers self-paced video lectures along with scheduled live interactive Q&A sessions and projects."
      },
      {
        q: "Will I get a course completion certificate?",
        a: "Yes! Once you complete 100% of all lectures and required assignments in a course, a verified certificate is generated."
      }
    ]
  },
  {
    id: "account",
    icon: <FaUsers />,
    title: "Account & Settings",
    desc: "Need help with your account or subscription?",
    questions: [
      {
        q: "How do I reset my account password?",
        a: "Click on 'Login' -> 'Forgot Password', enter your registered email address, and follow the link sent to your inbox."
      },
      {
        q: "Can I update my profile picture and details?",
        a: "Yes, navigate to your Student Dashboard -> Settings section to update your display picture, bio, and personal info."
      },
      {
        q: "Is my personal and payment data secure?",
        a: "Absolutely. We use industry-standard SSL encryption and secure payment gateways to safeguard your information."
      }
    ]
  },
  {
    id: "technical",
    icon: <FaTools />,
    title: "Technical Support",
    desc: "Facing technical issues? We're here to help.",
    questions: [
      {
        q: "What should I do if a video fails to play?",
        a: "Try refreshing your browser, clearing your browser cache, or checking your internet connection. If the issue persists, contact us."
      },
      {
        q: "Which browsers are supported?",
        a: "CodeLearn works smoothly on modern versions of Chrome, Firefox, Safari, Edge, and mobile browsers."
      },
      {
        q: "How can I report a technical bug?",
        a: "Fill out the contact form above with subject 'Technical Support' or reach out via support@codelearn.com."
      }
    ]
  },
  {
    id: "general",
    icon: <FaQuestionCircle />,
    title: "General Queries",
    desc: "Any other questions? Let us know.",
    questions: [
      {
        q: "Can I access courses on mobile devices?",
        a: "Yes! Our web application is fully responsive and optimized for mobile, tablet, and desktop screens."
      },
      {
        q: "How can I become an instructor on CodeLearn?",
        a: "Create an instructor account through the Signup page or reach out to our team to submit your instructor application."
      },
      {
        q: "Who do I contact for partnership or business inquiries?",
        a: "Please send an email directly to support@codelearn.com with your proposal and business details."
      }
    ]
  },
];

const Contact = () => {
  const [learnersCount, setLearnersCount] = useState("1+");
  const [activeModalCategory, setActiveModalCategory] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const statsData = await getHomePageStats();
      if (statsData?.learnersCount) {
        const n = Number(statsData.learnersCount);
        if (n >= 1000) {
          setLearnersCount(`${(n / 1000).toFixed(1).replace(/\.0$/, '')}K+`);
        } else {
          setLearnersCount(`${n}+`);
        }
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full bg-[#F9FAFE] text-gray-800 font-sans min-h-screen">
      
      {/* 1. HERO HEADER WITH DOODLES */}
      <section className="relative pt-12 pb-10 px-4 text-center max-w-[1240px] mx-auto overflow-hidden sm:overflow-visible">
        {/* Left Doodle: Dots + "Let's Talk" */}
        <div className="absolute top-2 left-2 lg:left-8 w-28 sm:w-36 md:w-44 pointer-events-none select-none hidden sm:block">
          <img src={contactLeftDoodle} alt="" className="w-full object-contain" />
        </div>

        {/* Right Doodle: Origami Airplane + "We're Here for You" */}
        <div className="absolute top-4 right-2 lg:right-6 w-36 sm:w-44 md:w-56 pointer-events-none select-none hidden sm:block">
          <img src={contactRightDoodle} alt="" className="w-full object-contain" />
        </div>

        {/* Badge: Get in Touch */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#13AA92]/10 border border-[#13AA92]/30 text-[#3BA7F2] text-xs font-semibold mb-3.5 shadow-xs">
          <FiMessageSquare className="text-xs" />
          <span>Get in Touch</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold text-[#0F172A] tracking-tight leading-tight sm:leading-[1.25]">
          <span className="relative inline-block">
            <svg
              className="absolute -top-3.5 -left-7 w-6 h-6 text-[#3BA7F2] select-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="2" y1="16" x2="8" y2="15" />
              <line x1="5" y1="10" x2="11" y2="7" />
              <line x1="10" y1="5" x2="14" y2="2" />
            </svg>
            We're Here to Help You
          </span>
          <br />
          on Your <span className="text-[#3BA7F2]">Learning Journey</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto mt-2.5 font-normal leading-relaxed">
          Have a question, suggestion, or need support? Our team is always ready to assist you.
          <br className="hidden sm:inline" /> Reach out to us anytime!
        </p>
      </section>

      {/* 2. CONTACT CONTENT SECTION */}
      <section className="max-w-[1240px] mx-auto px-4 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Other Ways to Reach Us */}
          <div className="lg:col-span-4">
            <ContactDetails />
          </div>

          {/* Right Column: Got an Idea? Let's Build It Together Form */}
          <div className="lg:col-span-8">
            <ContactForm />
          </div>

        </div>
      </section>

      {/* 3. FREQUENTLY ASKED QUESTIONS SECTION */}
      <section className="max-w-[1240px] mx-auto px-4 py-8 text-center">
        {/* FAQ Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#13AA92]/10 border border-[#13AA92]/30 text-[#3BA7F2] text-xs font-semibold mb-2.5 shadow-xs">
          <FiHelpCircle className="text-xs" />
          <span>FAQ</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-8">
          Frequently Asked <span className="text-[#3BA7F2]">Questions</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {faqCategories.map((faq) => (
            <div
              key={faq.id}
              onClick={() => setActiveModalCategory(faq)}
              className="bg-white border border-gray-200/90 hover:border-indigo-300 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-xs hover:shadow-sm cursor-pointer group"
            >
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-[#13AA92]/10 flex items-center justify-center text-[#3BA7F2] text-lg group-hover:scale-105 transition-transform">
                  {faq.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-snug">
                  {faq.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed font-normal">
                  {faq.desc}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#3BA7F2] mt-5 group-hover:gap-2 transition-all">
                <span>View FAQ</span>
                <FiArrowRight className="text-xs" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. JOIN COMMUNITY BANNER */}
      <section className="max-w-[1240px] mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-9 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs text-left overflow-hidden">
          
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#13AA92]/10 flex items-center justify-center text-[#3BA7F2] text-2xl shrink-0">
              <FaUsers />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
                Join a Community of <span className="text-[#3BA7F2]">{learnersCount} Learners</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-normal">
                Learn, build, and grow together with CodeLearn.
              </p>

              <div className="mt-4">
                <Link to="/courses">
                  <button className="flex items-center gap-2 bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-500/20">
                    <span>Explore Courses</span>
                    <FiArrowRight className="text-xs" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Clean 3D Workspace Illustration */}
          <div className="shrink-0 flex items-center justify-center md:justify-end">
            <img
              src={contactCommunityIllustration}
              alt="Better Learning Together"
              className="w-56 sm:w-64 md:w-72 object-contain"
            />
          </div>

        </div>
      </section>

      {/* FAQ POPUP MODAL (LIGHT THEMED) */}
      {activeModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl text-left animate-in fade-in zoom-in duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveModalCategory(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            >
              <FaTimes className="text-xs" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-[#13AA92]/10 flex items-center justify-center text-[#3BA7F2] text-lg">
                {activeModalCategory.icon}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                  {activeModalCategory.title}
                </h3>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  Frequently Asked Questions & Answers
                </p>
              </div>
            </div>

            {/* Questions & Answers List */}
            <div className="space-y-3.5 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
              {activeModalCategory.questions.map((item, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-[#3BA7F2] flex items-start gap-1.5">
                    <span className="font-extrabold">Q.</span>
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal pl-3 border-l-2 border-[#3BA7F2]">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>

            {/* Close CTA */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setActiveModalCategory(null)}
                className="bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-500/20"
              >
                Close FAQ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Contact;

