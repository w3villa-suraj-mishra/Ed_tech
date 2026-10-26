import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaTwitter, FaGithub, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { VscCode } from "react-icons/vsc";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { token } = useSelector((state) => state.auth);

  return (
    <footer className="w-full bg-white text-gray-600 font-sans border-t border-gray-200 transition-colors">
      <div className="w-11/12 max-w-[1280px] mx-auto py-8 px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-8 border-b border-gray-200/80">
          
          {/* Col 1: Brand & Mission */}
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg shadow-sm group-hover:scale-105 transition-transform">
                <VscCode />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-bold text-lg tracking-tight leading-none">
                  CodeLearn
                </span>
                <span className="text-[9px] text-gray-500 font-semibold tracking-wider uppercase mt-1">
                  Learn • Build • Grow
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm">
              Empowering the next generation of engineers through structured curriculums, interactive coding playgrounds, and real-world project portfolios.
            </p>

            {/* Blue Social Icon Pill directly below paragraph */}
            <div className="mt-1 flex items-center justify-center gap-3.5 bg-[#6EA8FE] px-6 py-2.5 rounded-full w-fit shadow-xs">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#3B82F6] font-bold text-xs shadow-xs hover:scale-110 transition-transform"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#3B82F6] font-bold text-xs shadow-xs hover:scale-110 transition-transform"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#3B82F6] font-bold text-xs shadow-xs hover:scale-110 transition-transform"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#3B82F6] font-bold text-xs shadow-xs hover:scale-110 transition-transform"
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <h3 className="text-gray-900 font-bold text-xs uppercase tracking-wider mb-1">Platform</h3>
            <Link to="/courses" className="text-gray-600 hover:text-blue-600 transition-colors">Course Catalog</Link>
            <Link to="/catalog" className="text-gray-600 hover:text-blue-600 transition-colors">Categories</Link>
            <Link to="/practice" className="text-gray-600 hover:text-blue-600 transition-colors">Practice Center</Link>
            <Link to={token ? "/t/u/activeCourses" : "/login"} className="text-gray-600 hover:text-blue-600 transition-colors">Active Courses</Link>
          </div>

          {/* Col 3: Resources & Support */}
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <h3 className="text-gray-900 font-bold text-xs uppercase tracking-wider mb-1">Resources</h3>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About Us</Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact Support</Link>
            <Link to="/practice/daily-quiz" className="text-gray-600 hover:text-blue-600 transition-colors">Daily Quizzes</Link>
            <Link to="/dashboard/help" className="text-gray-600 hover:text-blue-600 transition-colors">Help Center</Link>
          </div>

          {/* Col 4: Teaching & Community */}
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <h3 className="text-gray-900 font-bold text-xs uppercase tracking-wider mb-1">Instructors</h3>
            <Link to="/signup" className="text-gray-600 hover:text-blue-600 transition-colors">Become an Instructor</Link>
            <Link to="/dashboard/my-courses" className="text-gray-600 hover:text-blue-600 transition-colors">Instructor Portal</Link>
            <Link to="/courses" className="text-gray-600 hover:text-blue-600 transition-colors">Enterprise Tracks</Link>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Links */}
        <div className="mt-4 flex flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="whitespace-nowrap sm:whitespace-normal">© {currentYear} CodeLearn Inc.</p>
          
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all">Privacy</Link>
            <Link to="/about" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
