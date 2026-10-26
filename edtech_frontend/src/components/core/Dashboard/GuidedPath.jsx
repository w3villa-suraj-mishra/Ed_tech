import React from "react";
import { VscCompass, VscCheck } from "react-icons/vsc";

const GuidedPath = () => {
  const paths = [
    {
      id: 1,
      title: "Full Stack Web Development (MERN)",
      description: "Structured learning roadmap from basic HTML/CSS to advanced React, Node.js, Express, and MongoDB.",
      level: "Beginner to Advanced",
      modules: 12,
      duration: "16 Weeks",
      topics: ["HTML/CSS & Tailwind", "JavaScript ES6+", "React & Redux Toolkit", "Node.js & MongoDB APIs"]
    },
    {
      id: 2,
      title: "Data Structures & Algorithms (Java / C++)",
      description: "Master problem solving techniques required for top tech company coding interviews.",
      level: "Intermediate",
      modules: 10,
      duration: "12 Weeks",
      topics: ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "System Design Basics"]
    },
    {
      id: 3,
      title: "DevOps & Cloud Engineering",
      description: "Learn CI/CD automation, Docker containerization, Kubernetes orchestration, and AWS Cloud deployments.",
      level: "Advanced",
      modules: 8,
      duration: "10 Weeks",
      topics: ["Docker & Containers", "Kubernetes", "GitHub Actions CI/CD", "AWS Architecture"]
    }
  ];

  return (
    <div className="text-white space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-richblack-5 flex items-center gap-2">
          <VscCompass className="text-indigo-400" /> Guided Learning Paths
        </h1>
        <p className="text-xs text-richblack-300 mt-1">
          Follow step-by-step curated paths to master full-stack software development and engineering.
        </p>
      </div>

      {/* Path List */}
      <div className="space-y-4">
        {paths.map((path) => (
          <div
            key={path.id}
            className="bg-[#12161F] border border-[#252C3A] hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#252C3A] pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full">
                  {path.level}
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{path.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{path.description}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-300 font-semibold shrink-0">
                <span className="bg-[#1C2230] px-3 py-1.5 rounded-lg border border-[#2B3444]">
                  {path.modules} Modules
                </span>
                <span className="bg-[#1C2230] px-3 py-1.5 rounded-lg border border-[#2B3444]">
                  {path.duration}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Key Covered Modules:
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {path.topics.map((topic, i) => (
                  <div
                    key={i}
                    className="bg-[#1A202C] border border-[#2D3748] rounded-xl px-3 py-2 text-xs flex items-center gap-2 text-slate-200"
                  >
                    <VscCheck className="text-emerald-400 text-sm shrink-0" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuidedPath;
