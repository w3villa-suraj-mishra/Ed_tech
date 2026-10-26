import React from 'react';
import timelineImage from "../../../assests/Images/TimelineImage.png";
import { FiAward, FiUsers, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

const timelineData = [
  {
    icon: FiAward,
    heading: "Industry-Standard Curriculum",
    description: "Curated in partnership with engineering leaders from tier-1 tech companies, updated monthly to reflect modern production stacks.",
  },
  {
    icon: FiCheckCircle,
    heading: "Hands-On Capstone Projects",
    description: "Build, test, and deploy real production applications that demonstrate deep architectural reasoning in your portfolio.",
  },
  {
    icon: FiUsers,
    heading: "Direct 1-on-1 Mentor Guidance",
    description: "Receive personalized code reviews, architectural feedback, and actionable suggestions to level up your engineering skills.",
  },
  {
    icon: FiTrendingUp,
    heading: "Career Placement & Coaching",
    description: "Comprehensive interview prep, algorithm deep dives, resume reviews, and direct introductions to hiring partners.",
  },
];

const TimelineSection = () => {
  return (
    <div className="w-full py-12 lg:py-16">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Left Side: Timeline Pillars */}
        <div className="w-full lg:w-[48%] flex flex-col gap-6">
          {timelineData.map((item, index) => {
            const IconComponent = item.icon;
            const isLast = index === timelineData.length - 1;
            return (
              <div key={index} className="flex gap-4 sm:gap-5 group">
                {/* Icon & Connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 rounded-2xl glass-card border border-white/80 flex items-center justify-center text-gray-500 text-xl shadow-md group-hover:scale-110 group-hover:bg-[#3BA7F2] group-hover:border-white group-hover:text-white transition-all duration-300">
                    <IconComponent />
                  </div>
                  {!isLast && (
                    <div className="w-0.5 h-12 sm:h-14 bg-blue-300/40 my-2"></div>
                  )}
                </div>

                {/* Text Details */}
                <div className="pt-1">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-snug group-hover:text-[#3BA7F2] transition-colors">
                    {item.heading}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Photo with Floating Glass Credibility Badges */}
        <div className="w-full lg:w-[48%] relative flex justify-center">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 glass-card max-w-lg w-full">
            <img
              src={timelineImage}
              alt="Students collaborating and coding"
              className="w-full h-auto object-cover transform hover:scale-102 transition-transform duration-500"
            />

            {/* Overlaid Floating Metrics Card - Frosted Glass */}
            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 glass-card rounded-2xl p-3 sm:p-5 shadow-2xl border border-white/90 flex items-center justify-between divide-x divide-white/60 backdrop-blur-xl">
              <div className="px-1.5 sm:px-4 flex flex-col text-center">
                <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#3BA7F2] tracking-tight">10+</span>
                <span className="text-[9px] sm:text-[11px] md:text-xs font-medium text-gray-600 mt-0.5">Years of Excellence</span>
              </div>

              <div className="px-1.5 sm:px-4 flex flex-col text-center">
                <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-purple-600 tracking-tight">250+</span>
                <span className="text-[9px] sm:text-[11px] md:text-xs font-medium text-gray-600 mt-0.5">Specialized Courses</span>
              </div>

              <div className="px-1.5 sm:px-4 flex flex-col text-center">
                <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-600 tracking-tight">89%</span>
                <span className="text-[9px] sm:text-[11px] md:text-xs font-medium text-gray-600 mt-0.5">Placement Success</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TimelineSection;
