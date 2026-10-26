import React from 'react';
import { Link } from 'react-router-dom';
import Instructor from "../../../assests/Images/Instructor.png";
import { FiUsers, FiDollarSign, FiArrowRight } from "react-icons/fi";

const InstructorSection = () => {
  return (
    <section className="w-full max-w-maxContent mx-auto my-8 px-4 py-[15px]">
      <div className="rounded-3xl bg-gradient-to-br from-blue-500/10 via-white/70 to-purple-500/10 backdrop-blur-2xl border border-white/80 p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Side: Instructor Image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative rounded-3xl overflow-hidden border-4 border-white/80 shadow-2xl max-w-md w-full aspect-[4/3] glass-card">
            <img
              src={Instructor}
              alt="Become an Instructor on CodeLearn"
              className="w-full h-full object-cover transform hover:scale-103 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Right Side: Copy & Benefits */}
        <div className="w-full lg:w-1/2 flex flex-col items-start gap-6 text-left">
          
          <div className="inline-flex items-center gap-1.5 glass-pill text-[#13AA92] text-xs font-semibold px-4 py-1.5 rounded-full border border-white/80 shadow-sm">
            <FiUsers className="text-xs text-[#13AA92]" />
            <span>Instructor Community</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            Share Your Knowledge & <br className="hidden sm:inline" />
            <span className="accent-gradient-text">
              Teach Millions Worldwide
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
            Instructors from top tech firms teach on CodeLearn. We provide the interactive lab player, test builders, analytics, and global student community to help you build an influential educational brand.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-1">
            <div className="glass-card glass-card-hover border border-white/80 p-4.5 rounded-2xl flex items-center gap-3.5 shadow-sm group">
              <div className="w-11 h-11 rounded-xl glass-card text-gray-500 flex items-center justify-center text-lg shrink-0 group-hover:bg-[#3BA7F2] group-hover:text-white transition-all duration-300 shadow-xs">
                <FiUsers />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block group-hover:text-[#3BA7F2] transition-colors">Global Reach</span>
                <span className="text-[11px] text-gray-500">50K+ Active Engineers</span>
              </div>
            </div>

            <div className="glass-card glass-card-hover border border-white/80 p-4.5 rounded-2xl flex items-center gap-3.5 shadow-sm group">
              <div className="w-11 h-11 rounded-xl glass-card text-gray-500 flex items-center justify-center text-lg shrink-0 group-hover:bg-[#3BA7F2] group-hover:text-white transition-all duration-300 shadow-xs">
                <FiDollarSign />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block group-hover:text-[#3BA7F2] transition-colors">Top Revenue Share</span>
                <span className="text-[11px] text-gray-500">Earn monthly recurring income</span>
              </div>
            </div>
          </div>

          {/* CTA Action Button */}
          <div className="pt-2">
            <Link to="/signup">
              <button className="flex items-center gap-2 bg-[#3BA7F2]/90 hover:bg-[#3BA7F2] backdrop-blur-md text-white font-semibold text-sm px-7 py-3.5 rounded-2xl border border-white/30 shadow-[0_8px_25px_rgba(59,167,242,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 group">
                <span>Start Teaching Today</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
};

export default InstructorSection;
