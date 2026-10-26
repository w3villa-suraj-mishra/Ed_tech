import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiAward } from 'react-icons/fi';
import { getSpotlightInstructors } from '../../../services/admin/instructorSpotlightAPI';

const mentorsListFallback = [
  {
    name: "Suraj Mishra",
    role: "Senior Engineering Specialist & Tech Lead",
    experience: "9+ Years Building Production Systems",
    titleQuote: "Master deep problem-solving with real engineering rigor.",
    quote: '"True engineering excellence is not memorizing syntax—it is understanding memory models, asynchronous concurrency, and building resilient distributed systems that stay up under massive loads. That is what we teach every single day."',
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    studentsMentored: "38,000+",
    badgeText: "Verified Industry Lead",
    skills: ["Fullstack Architecture", "Kubernetes", "DevOps Pipelines"],
    published: true
  },
  {
    name: "Lakshay Kumar",
    role: "Ex-Microsoft & Amazon Principal Architect",
    experience: "12+ Years Industry Experience",
    titleQuote: "Transforming ambitious learners into world-class software engineers.",
    quote: '"We bridge the critical chasm between academic theory and high-scale production systems. Through rigorous architectural reviews, real distributed challenges, and disciplined code practices, our students build the confidence to lead engineering teams worldwide."',
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    studentsMentored: "45,000+",
    badgeText: "Verified Industry Lead",
    skills: ["System Architecture", "Microservices", "Cloud Scaling"],
    published: true
  }
];

const InstructorSlider = ({ dynamicInstructors = [] }) => {
  const [current, setCurrent] = useState(0);

  const [spotlightList, setSpotlightList] = useState(() => {
    try {
      const list = getSpotlightInstructors();
      const active = list.filter((i) => i.published !== false);
      return active.length > 0 ? active : mentorsListFallback;
    } catch {
      return mentorsListFallback;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const list = getSpotlightInstructors();
        const active = list.filter((i) => i.published !== false);
        setSpotlightList(active.length > 0 ? active : mentorsListFallback);
      } catch {}
    };

    window.addEventListener('instructor-spotlight-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('instructor-spotlight-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const mentors = (dynamicInstructors && dynamicInstructors.length > 0)
    ? dynamicInstructors.map(inst => ({
        name: `${inst.firstName || ''} ${inst.lastName || ''}`.trim() || 'Expert Mentor',
        role: inst.profile?.about ? inst.profile.about.slice(0, 45) : "Senior Engineering Specialist",
        experience: "Senior Tech Educator",
        titleQuote: "Master production code with industry specialists.",
        quote: inst.profile?.about || 'From early prototypes to global web platforms, we guide you through every architectural decision with real-world feedback.',
        image: inst.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
        studentsMentored: "20,000+",
        badgeText: "Verified Industry Lead",
        skills: ["Software Engineering", "Full-Stack"]
      }))
    : spotlightList;

  useEffect(() => {
    if (mentors.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === mentors.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(timer);
  }, [mentors.length]);

  const activeMentor = mentors[current] || mentors[0];

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? mentors.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === mentors.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="w-full max-w-maxContent mx-auto px-4 text-left py-[15px]">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 glass-pill text-[#13AA92] text-xs font-semibold px-4 py-1.5 rounded-full border border-white/80 shadow-sm">
            <FiAward className="text-xs text-[#13AA92]" />
            <span>World-Class Faculty</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mt-3">
            Meet Your Mentors
          </h2>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
            Learn directly from seasoned engineers and tech leads from Microsoft, Amazon, Google, and hyper-growth startups.
          </p>
        </div>
      </div>

      {/* Main Mentor Card - Frosted Glass Card */}
      <div className="rounded-3xl glass-card border border-white/80 shadow-2xl p-6 sm:p-10 lg:p-12 transition-all duration-300">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          
          {/* Left Column: Mentor Portrait & Credibility */}
          <div className="w-full lg:w-[40%] flex flex-col items-center text-center">
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-4 border-white/80 shadow-xl glass-card">
              <img
                src={activeMentor.image}
                alt={activeMentor.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 glass-card rounded-xl py-1.5 px-3 border border-white/80 shadow-md flex items-center justify-center gap-1.5 text-xs font-bold text-gray-900 backdrop-blur-xl">
                <FiCheckCircle className="text-[#3BA7F2] text-xs" />
                <span>{activeMentor.badgeText || "Verified Industry Lead"}</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-4">
              {activeMentor.name}
            </h3>
            <p className="text-xs font-semibold text-[#3BA7F2] mt-0.5">
              {activeMentor.role}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Mentored {activeMentor.studentsMentored} Engineers
            </p>

            {/* Skills Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              {(Array.isArray(activeMentor.skills) ? activeMentor.skills : (activeMentor.skills || '').split(',')).map((skill, i) => (
                <span key={i} className="text-[10px] glass-pill text-gray-700 px-3 py-0.5 rounded-full font-medium border border-white/80 shadow-2xs">
                  {typeof skill === 'string' ? skill.trim() : skill}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Quote & Insight */}
          <div className="w-full lg:w-[60%] flex flex-col justify-center">
            <span className="text-5xl text-[#3BA7F2]/25 font-serif leading-none select-none">“</span>
            
            <h4 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight leading-snug -mt-4">
              {activeMentor.titleQuote}
            </h4>

            <p className="text-sm sm:text-base text-gray-600 mt-4 leading-relaxed font-normal">
              {activeMentor.quote}
            </p>

            <div className="mt-8 pt-6 border-t border-white/60 flex items-center justify-between">
              <div>
                <span className="block text-sm font-bold text-gray-900">{activeMentor.name}</span>
                <span className="text-xs text-gray-500">{activeMentor.experience}</span>
              </div>

              {/* Progress dots indicator */}
              {mentors.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {mentors.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrent(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        current === idx
                          ? "w-6 bg-[#3BA7F2]"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to mentor ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Slider Controls */}
      <div className="flex justify-end items-center gap-3 mt-6 pr-2">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full glass-card hover:bg-white text-gray-700 hover:text-[#3BA7F2] border border-white/80 flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95"
          aria-label="Previous Mentor"
        >
          <FiChevronLeft className="text-xl" />
        </button>
        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full glass-card hover:bg-white text-gray-700 hover:text-[#3BA7F2] border border-white/80 flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95"
          aria-label="Next Mentor"
        >
          <FiChevronRight className="text-xl" />
        </button>
      </div>

    </section>
  );
};

export default InstructorSlider;
