import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchCourseCategories } from '../services/operations/courseDetailsAPI';
import PaginationControls from '../components/Common/PaginationControls';
import {
  FiBarChart2,
  FiSmartphone,
  FiArrowRight,
  FiSearch,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiGrid,
  FiBookOpen
} from "react-icons/fi";
import { FaPenNib, FaDatabase, FaBrain } from "react-icons/fa";

const categoryDesignPresets = [
  {
    name: "Web Development",
    type: "code",
    description: "Learn full-stack web development with modern tools and frameworks.",
    courseCount: "2+",
    gradient: "from-[#93C5FD] via-[#60A5FA] to-[#3BA7F2]",
    glowShadow: "shadow-[0_8px_20px_rgba(59,130,246,0.3)]",
    pillBg: "bg-[#EFF6FF] text-[#3BA7F2] border-[#DBEAFE]"
  },
  {
    name: "Data Science",
    type: "chart",
    description: "Master data analysis, machine learning, and visualization.",
    courseCount: "2+",
    gradient: "from-[#E9D5FF] via-[#C084FC] to-[#A855F7]",
    glowShadow: "shadow-[0_8px_20px_rgba(168,85,247,0.3)]",
    pillBg: "bg-[#FAF5FF] text-[#9333EA] border-[#F3E8FF]"
  },
  {
    name: "Mobile Development",
    type: "mobile",
    description: "Build stunning iOS and Android apps for real-world use.",
    courseCount: "1+",
    gradient: "from-[#A7F3D0] via-[#34D399] to-[#10B981]",
    glowShadow: "shadow-[0_8px_20px_rgba(16,185,129,0.3)]",
    pillBg: "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]"
  },
  {
    name: "UI/UX Design",
    type: "pen",
    description: "Create beautiful and user-friendly interfaces that make an impact.",
    courseCount: "1+",
    gradient: "from-[#FED7AA] via-[#FB923C] to-[#F97316]",
    glowShadow: "shadow-[0_8px_20px_rgba(249,115,22,0.3)]",
    pillBg: "bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]"
  },
  {
    name: "Data Structures & Algorithms",
    type: "database",
    description: "Learn problem solving and coding interview concepts.",
    courseCount: "1+",
    gradient: "from-[#FECDD3] via-[#FB7185] to-[#F43F5E]",
    glowShadow: "shadow-[0_8px_20px_rgba(244,63,94,0.3)]",
    pillBg: "bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]"
  },
  {
    name: "Machine Learning",
    type: "brain",
    description: "Build models and intelligent systems using real data.",
    courseCount: "1+",
    gradient: "from-[#DDD6FE] via-[#A78BFA] to-[#13AA92]",
    glowShadow: "shadow-[0_8px_20px_rgba(124,58,237,0.3)]",
    pillBg: "bg-[#13AA92]/10 text-[#13AA92] border-[#13AA92]/30"
  }
];

const renderCategoryIcon = (type) => {
  switch (type) {
    case "code":
      return <span className="font-mono font-black text-xl text-white drop-shadow-xs">&lt;/&gt;</span>;
    case "chart":
      return <FiBarChart2 className="text-2xl text-white drop-shadow-xs" />;
    case "mobile":
      return <FiSmartphone className="text-2xl text-white drop-shadow-xs" />;
    case "pen":
      return <FaPenNib className="text-xl text-white drop-shadow-xs" />;
    case "database":
      return <FaDatabase className="text-xl text-white drop-shadow-xs" />;
    case "brain":
      return <FaBrain className="text-xl text-white drop-shadow-xs" />;
    default:
      return <FiGrid className="text-2xl text-white drop-shadow-xs" />;
  }
};

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('category') || '');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);

  const [apiMetrics, setApiMetrics] = useState({
    responseTimeMs: null,
    endpoint: '/api/v1/course/showAllCategories',
    httpMethod: 'GET',
    status: null,
    fetchedAt: null
  });

  const loadCategories = async (page = currentPage, limit = itemsPerPage, search = searchQuery) => {
    setLoading(true);
    const startTime = performance.now();
    try {
      const data = await fetchCourseCategories(page, limit, search);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      setCategories(Array.isArray(data) ? data : []);
      setTotalCategories(data.totalCategories || data.length || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page);

      setApiMetrics({
        responseTimeMs: duration,
        endpoint: `/api/v1/course/showAllCategories?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`,
        httpMethod: 'GET',
        status: '200 OK',
        fetchedAt: new Date().toLocaleTimeString()
      });
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setApiMetrics({
        responseTimeMs: duration,
        endpoint: '/api/v1/course/showAllCategories',
        httpMethod: 'GET',
        status: 'Error / Failed',
        fetchedAt: new Date().toLocaleTimeString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlQuery = searchParams.get('search') || searchParams.get('category') || '';
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
      loadCategories(1, itemsPerPage, urlQuery);
    } else {
      loadCategories(currentPage, itemsPerPage, searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentPage, itemsPerPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCategories(1, itemsPerPage, searchQuery);
  };

  const getLatencyBadgeColor = (ms) => {
    if (!ms) return 'bg-gray-100 text-gray-700 border-gray-200';
    if (ms < 300) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (ms < 800) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb & Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link to="/" className="hover:text-[#3BA7F2] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Categories</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Explore All <span className="text-[#3BA7F2]">Course Categories</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Paginated DB categories with real-time performance metrics and search filters.
              </p>
            </div>
            
            <button
              onClick={() => loadCategories(currentPage, itemsPerPage, searchQuery)}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-[#3BA7F2] text-gray-700 hover:text-[#3BA7F2] font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Fetching API...' : 'Refetch API'}</span>
            </button>
          </div>
        </div>

        {/* API Response Time & Status Benchmark Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wide">
              <FiClock className="text-[#3BA7F2] text-sm" />
              <span>API Execution & Benchmark Metrics</span>
            </div>
            {apiMetrics.fetchedAt && (
              <span className="text-[11px] text-gray-400">
                Last Call: {apiMetrics.fetchedAt}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {/* Latency / Duration */}
            <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500 mb-1">API Response Time</span>
              <div className="flex items-baseline gap-1.5">
                {loading ? (
                  <span className="text-sm font-semibold text-gray-400 animate-pulse">Measuring...</span>
                ) : (
                  <>
                    <span className="text-xl font-extrabold text-gray-900">
                      {apiMetrics.responseTimeMs !== null ? `${apiMetrics.responseTimeMs}` : 'N/A'}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">ms</span>
                  </>
                )}
              </div>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-2 w-max ${getLatencyBadgeColor(apiMetrics.responseTimeMs)}`}>
                {loading ? 'Measuring' : (apiMetrics.responseTimeMs < 300 ? '⚡ Ultra Fast' : 'Normal Latency')}
              </span>
            </div>

            {/* API Endpoint */}
            <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500 mb-1">Paginated Route</span>
              <div className="font-mono text-xs font-bold text-gray-800 truncate" title={apiMetrics.endpoint}>
                <span className="text-purple-600 font-extrabold mr-1">{apiMetrics.httpMethod}</span>
                {apiMetrics.endpoint}
              </div>
              <span className="text-[10px] text-gray-500 mt-2">Page {currentPage} of {totalPages}</span>
            </div>

            {/* Status Code */}
            <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500 mb-1">HTTP Status</span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 text-sm">
                <FiCheckCircle className="text-emerald-500" />
                <span>{apiMetrics.status || (loading ? 'Calling...' : '200 OK')}</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-2">Database Connection</span>
            </div>

            {/* Category Count */}
            <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500 mb-1">Items Page / Total</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-gray-900">
                  {categories.length}
                </span>
                <span className="text-xs text-gray-500">/ {totalCategories} DB Rows</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-2">Paginated DB Result</span>
            </div>
          </div>
        </div>

        {/* Search & Items Per Page Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96 flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search category by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#3BA7F2] transition-colors shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="bg-[#3BA7F2] hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs text-gray-500 font-medium">Per Page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const val = Number(e.target.value);
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#3BA7F2]"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-150 rounded w-full" />
                <div className="h-4 bg-gray-150 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
            <FiBookOpen className="text-4xl text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">No categories found</h3>
            <p className="text-xs text-gray-500">Try adjusting your search criteria or page offset.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const preset = categoryDesignPresets.find(
                (p) => (p.name || '').toLowerCase() === (cat.name || '').toLowerCase()
              ) || categoryDesignPresets[idx % categoryDesignPresets.length];

              const categoryId = cat._id || cat.id;
              const categorySlug = (cat.name || preset.name)
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '');

              const targetLink = categoryId
                ? `/courses?category=${categoryId}`
                : `/courses?category=${categorySlug}`;

              const count = cat.coursesCount !== undefined ? cat.coursesCount : (cat.courses?.length || 0);

              return (
                <div
                  key={categoryId || idx}
                  className="bg-white border border-gray-200/90 hover:border-purple-300 rounded-2xl p-6 flex flex-col justify-between space-y-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${preset.gradient} ${preset.glowShadow} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        {renderCategoryIcon(preset.type)}
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${preset.pillBg}`}>
                        {typeof count === 'number' && count > 0 ? `${count}+ Courses` : `${preset.courseCount} Courses`}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#3BA7F2] transition-colors">
                        {cat.name || preset.name}
                      </h2>
                      <p className="text-xs text-gray-600 leading-relaxed mt-1.5 line-clamp-3">
                        {cat.description || preset.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-mono">
                      ID: {categoryId ? String(categoryId).substring(0, 10) + '...' : 'Preset'}
                    </span>
                    <Link
                      to={targetLink}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3BA7F2] hover:text-purple-600 transition-colors"
                    >
                      <span>Explore Courses</span>
                      <FiArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enterprise Pagination Bar */}
        {!loading && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCategories}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}

      </div>
    </div>
  );
}
