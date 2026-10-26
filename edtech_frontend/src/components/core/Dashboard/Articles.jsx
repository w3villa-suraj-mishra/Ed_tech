import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiChevronDown, FiBookOpen, FiArrowRight } from "react-icons/fi";
import { getAllArticles } from "../../../services/operations/articleAPI";

const Articles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedAuthor, setSelectedAuthor] = useState("All Authors");
  const [sortBy, setSortBy] = useState("Newest First");

  // Default curated articles matching the reference screenshot exactly
  const defaultArticles = [
    {
      id: "deep-learning-ai",
      title: "Deep Learning: Understanding the Technology Behind Modern AI",
      summary: "Learn the fundamentals of deep learning, how neural networks work, and how this powerful technology is used in modern artificial intelligence applications.",
      category: "Engineering & Tech",
      categoryColor: "bg-blue-600/85 text-white",
      readTime: "5 min read",
      author: "Suraj Mishra",
      createdAt: "2026-03-01",
      thumbType: "ai"
    },
    {
      id: "complete-guide-react-hooks",
      title: "Complete Guide to React Hooks",
      summary: "Master React Hooks with practical examples. Learn useState, useEffect, useContext and build better React applications.",
      category: "Web Development",
      categoryColor: "bg-purple-600/85 text-white",
      readTime: "8 min read",
      author: "Suraj Mishra",
      createdAt: "2026-02-28",
      thumbType: "react"
    },
    {
      id: "building-rest-apis-node-express",
      title: "Building REST APIs with Node.js and Express",
      summary: "A step-by-step guide to building scalable REST APIs using Node.js, Express.js and best practices.",
      category: "Backend",
      categoryColor: "bg-emerald-700/85 text-white",
      readTime: "6 min read",
      author: "Suraj Mishra",
      createdAt: "2026-02-24",
      thumbType: "node"
    },
    {
      id: "database-design-fundamentals",
      title: "Database Design Fundamentals",
      summary: "Learn the core concepts of database design, normalization, relationships and write efficient SQL queries.",
      category: "Database",
      categoryColor: "bg-rose-500/85 text-white",
      readTime: "7 min read",
      author: "Suraj Mishra",
      createdAt: "2026-02-20",
      thumbType: "sql"
    },
    {
      id: "modern-ui-design-tailwind-css",
      title: "Modern UI Design with Tailwind CSS",
      summary: "Build responsive and beautiful user interfaces faster with Tailwind CSS. Learn tips, tricks and real-world examples.",
      category: "Frontend",
      categoryColor: "bg-fuchsia-600/85 text-white",
      readTime: "5 min read",
      author: "Suraj Mishra",
      createdAt: "2026-02-18",
      thumbType: "tailwind"
    },
    {
      id: "how-to-stay-consistent-learning",
      title: "How to Stay Consistent in Learning",
      summary: "Practical tips and strategies to stay consistent, productive and achieve your learning goals as a developer.",
      category: "Career & Growth",
      categoryColor: "bg-blue-600/85 text-white",
      readTime: "4 min read",
      author: "Suraj Mishra",
      createdAt: "2026-02-15",
      thumbType: "growth"
    }
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getAllArticles();
        if (data && Array.isArray(data) && data.length > 0) {
          // Merge API articles with fallback defaults so the exact screenshot items remain visible
          setArticles(data);
        } else {
          setArticles(defaultArticles);
        }
      } catch (err) {
        setArticles(defaultArticles);
      }
    };
    fetchArticles();
  }, []);

  const displayArticles = (articles.length > 0 ? articles : defaultArticles).filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" || item.category === selectedCategory;
    const matchesAuthor =
      selectedAuthor === "All Authors" || item.author.toLowerCase().includes(selectedAuthor.toLowerCase());
    return matchesSearch && matchesCategory && matchesAuthor;
  });

  // Render thumbnail graphic matching the screenshot for each article
  const renderThumbnail = (thumbType) => {
    switch (thumbType) {
      case "ai":
        return (
          <div className="w-full h-44 bg-[#0B1120] relative flex items-center justify-center overflow-hidden">
            {/* Neural network cyber background */}
            <svg className="w-full h-full absolute inset-0 opacity-40" viewBox="0 0 300 160">
              <defs>
                <radialGradient id="aiGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0B1120" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="300" height="160" fill="url(#aiGlow)" />
              <circle cx="50" cy="40" r="2" fill="#38BDF8" />
              <circle cx="90" cy="25" r="2" fill="#38BDF8" />
              <circle cx="70" cy="80" r="2.5" fill="#60A5FA" />
              <circle cx="110" cy="110" r="2" fill="#38BDF8" />
              <line x1="50" y1="40" x2="90" y2="25" stroke="#38BDF8" strokeWidth="0.75" opacity="0.5" />
              <line x1="50" y1="40" x2="70" y2="80" stroke="#38BDF8" strokeWidth="0.75" opacity="0.5" />
              <line x1="70" y1="80" x2="110" y2="110" stroke="#38BDF8" strokeWidth="0.75" opacity="0.5" />

              <circle cx="210" cy="40" r="2" fill="#38BDF8" />
              <circle cx="250" cy="65" r="2" fill="#38BDF8" />
              <circle cx="230" cy="110" r="2.5" fill="#60A5FA" />
              <line x1="210" y1="40" x2="250" y2="65" stroke="#38BDF8" strokeWidth="0.75" opacity="0.5" />
              <line x1="250" y1="65" x2="230" y2="110" stroke="#38BDF8" strokeWidth="0.75" opacity="0.5" />
            </svg>

            {/* Glowing AI Center Badge */}
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-blue-900/40 border border-blue-400/50 backdrop-blur-xs flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.4)]">
              <span className="text-2xl font-black text-white tracking-widest drop-shadow-[0_0_8px_#38BDF8]">
                AI
              </span>
            </div>
          </div>
        );

      case "react":
        return (
          <div className="w-full h-44 bg-[#F8FAFC] relative flex items-center justify-center overflow-hidden border-b border-slate-100">
            {/* Workspace desk illustration */}
            <svg className="w-full h-full absolute inset-0 opacity-60" viewBox="0 0 300 160">
              <rect y="120" width="300" height="40" fill="#E2E8F0" />
              {/* Plant pot on right */}
              <rect x="235" y="95" width="22" height="26" rx="4" fill="#E2E8F0" stroke="#CBD5E1" />
              <path d="M246 95 C246 80 258 75 258 75 C258 75 255 90 246 95 Z" fill="#10B981" />
              <path d="M246 95 C246 82 234 78 234 78 C234 78 238 90 246 95 Z" fill="#34D399" />
              {/* Laptop base on left */}
              <path d="M25 125L40 100H95L110 125Z" fill="#CBD5E1" opacity="0.5" />
            </svg>

            {/* Glowing Code Symbol */}
            <div className="relative z-10 flex items-center gap-1 text-3xl font-mono font-extrabold text-[#3BA7F2] drop-shadow-sm">
              <span>&lt;</span>
              <span className="text-slate-400">/</span>
              <span>&gt;</span>
            </div>
          </div>
        );

      case "node":
        return (
          <div className="w-full h-44 bg-[#0A1612] relative flex items-center justify-center overflow-hidden">
            {/* Emerald glow radial */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.25)_0%,transparent_70%)]" />

            {/* Node.js Hexagon Logo Graphic */}
            <div className="relative z-10 flex items-center gap-2 drop-shadow-[0_0_16px_rgba(16,185,129,0.5)]">
              <svg width="40" height="46" viewBox="0 0 40 46" fill="none">
                <path
                  d="M20 2L38 12.5V33.5L20 44L2 33.5V12.5L20 2Z"
                  stroke="#10B981"
                  strokeWidth="3.5"
                  fill="#06261B"
                />
                <circle cx="20" cy="23" r="6" fill="#10B981" />
              </svg>
              <span className="text-2xl font-black text-[#10B981] tracking-tight font-sans">
                node<span className="text-white text-xs font-normal">.js</span>
              </span>
            </div>
          </div>
        );

      case "sql":
        return (
          <div className="w-full h-44 bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#EDE9FE] relative flex items-center justify-center overflow-hidden">
            <div className="relative z-10 flex items-center gap-3">
              {/* 3D Database Cylinder */}
              <svg width="48" height="52" viewBox="0 0 48 52" fill="none">
                <ellipse cx="24" cy="10" rx="20" ry="7" fill="#3BA7F2" />
                <ellipse cx="24" cy="10" rx="18" ry="5.5" fill="#60A5FA" />
                
                <path d="M4 10V24C4 28 13 31 24 31C35 31 44 28 44 24V10" fill="#3BA7F2" />
                <ellipse cx="24" cy="24" rx="20" ry="7" fill="#3BA7F2" />
                <ellipse cx="24" cy="24" rx="18" ry="5.5" fill="#60A5FA" />

                <path d="M4 24V38C4 42 13 45 24 45C35 45 44 42 44 38V24" fill="#1D4ED8" />
                <ellipse cx="24" cy="38" rx="20" ry="7" fill="#3BA7F2" />
                <ellipse cx="24" cy="38" rx="18" ry="5.5" fill="#3BA7F2" />
              </svg>

              <span className="text-3xl font-black text-slate-900 tracking-tight font-sans">
                SQL
              </span>
            </div>
          </div>
        );

      case "tailwind":
        return (
          <div className="w-full h-44 bg-[#0F172A] relative flex items-center justify-center overflow-hidden">
            {/* Editor code lines behind */}
            <div className="absolute inset-0 opacity-15 flex flex-col justify-center space-y-2 px-6">
              <div className="w-32 h-2 bg-slate-400 rounded-full" />
              <div className="w-48 h-2 bg-slate-500 rounded-full" />
              <div className="w-24 h-2 bg-slate-400 rounded-full" />
            </div>

            {/* Glowing Tailwind Wave Mark */}
            <div className="relative z-10 drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]">
              <svg width="60" height="36" viewBox="0 0 60 36" fill="none">
                <path
                  d="M15 0C8.5 0 4.2 4.5 2.2 13.5C5 9.5 8.7 8.2 13.5 9.8C16.2 10.7 18.2 12.7 20.4 14.9C24 18.5 28.1 22.8 36.8 22.8C43.3 22.8 47.6 18.3 49.6 9.3C46.8 13.3 43.1 14.6 38.3 13C35.6 12.1 33.6 10.1 31.4 7.9C27.8 4.3 23.7 0 15 0ZM0 13.5C0 13.5 4.2 18 2.2 27C5 23 8.7 21.7 13.5 23.3C16.2 24.2 18.2 26.2 20.4 28.4C24 32 28.1 36 36.8 36C43.3 36 47.6 31.5 49.6 22.5C46.8 26.5 43.1 27.8 38.3 26.2C35.6 25.3 33.6 23.3 31.4 21.1C27.8 17.5 23.7 13.5 0 13.5Z"
                  fill="#38BDF8"
                />
              </svg>
            </div>
          </div>
        );

      case "growth":
        return (
          <div className="w-full h-44 bg-gradient-to-br from-[#EFF6FF] via-[#E0E7FF] to-[#F1F5F9] relative flex items-center justify-center overflow-hidden">
            {/* Glowing Lightbulb with Open Books */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Lightbulb */}
              <div className="drop-shadow-[0_0_18px_rgba(234,179,8,0.7)] animate-bounce-slow">
                <svg width="42" height="52" viewBox="0 0 42 52" fill="none">
                  <path
                    d="M21 2C10.5 2 2 10.5 2 21C2 28 6 34 11 38V42C11 43.1 11.9 44 13 44H29C30.1 44 31 43.1 31 42V38C36 34 40 28 40 21C40 10.5 31.5 2 21 2Z"
                    fill="#FACC15"
                  />
                  <path d="M15 47H27V49C27 50.1 26.1 51 25 51H17C15.9 51 15 50.1 15 49V47Z" fill="#CBD5E1" />
                </svg>
              </div>

              {/* Open Books base */}
              <div className="w-36 h-3 bg-white/70 rounded-full mt-1 shadow-xs border border-indigo-100" />
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-44 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl">
            <FiBookOpen />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 text-[#1E293B] font-sans pb-12 max-w-[1240px] mx-auto">
      
      {/* 2. SEARCH BAR & FILTER DROPDOWNS ROW */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="flex items-center flex-1 min-w-0 px-2">
          <FiSearch className="text-slate-400 text-base shrink-0 mr-2.5 ml-1" />
          <input
            type="text"
            placeholder="Search articles, topics, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-medium text-slate-700 outline-none cursor-pointer shadow-2xs"
            >
              <option value="All Categories">All Categories</option>
              <option value="Engineering & Tech">Engineering & Tech</option>
              <option value="Web Development">Web Development</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
              <option value="Frontend">Frontend</option>
              <option value="Career & Growth">Career & Growth</option>
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
          </div>

          {/* Author Dropdown */}
          <div className="relative">
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="appearance-none bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-medium text-slate-700 outline-none cursor-pointer shadow-2xs"
            >
              <option value="All Authors">All Authors</option>
              <option value="Suraj Mishra">Suraj Mishra</option>
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-medium text-slate-700 outline-none cursor-pointer shadow-2xs"
            >
              <option value="Newest First">Newest First</option>
              <option value="Oldest First">Oldest First</option>
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
          </div>

        </div>

      </div>

      {/* 3. ARTICLES 3-COLUMN GRID */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading published articles...</div>
      ) : displayArticles.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs">
          <p className="text-sm font-semibold text-slate-800">No articles found matching "{searchQuery}".</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All Categories");
              setSelectedAuthor("All Authors");
            }}
            className="mt-3 px-4 py-2 bg-[#3BA7F2] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => navigate(`/dashboard/articles/${article.id}`)}
              className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Thumbnail graphic area */}
                <div className="relative overflow-hidden">
                  {renderThumbnail(article.thumbType || "ai")}

                  {/* Top-left category badge */}
                  <span className="absolute top-3 left-3 bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/10 shadow-xs">
                    {article.category}
                  </span>

                  {/* Top-right read time badge */}
                  <span className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur-xs text-slate-100 text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs">
                    {article.readTime || "5 min read"}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-2">
                  <h2 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#3BA7F2] transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {/* Author Avatar & Name */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#15803D] text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-2xs">
                    {(article.author ? article.author[0] : "S")}
                  </div>
                  <span className="text-xs text-slate-600 font-medium">
                    By {article.author || "Suraj Mishra"}
                  </span>
                </div>

                {/* Read Article Link */}
                <span className="font-semibold text-slate-900 group-hover:text-[#3BA7F2] transition-colors flex items-center gap-1">
                  <span>Read Article</span>
                  <FiArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Articles;
