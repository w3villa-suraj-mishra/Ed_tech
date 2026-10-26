import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAllCourses, fetchCourseCategories } from "../services/operations/courseDetailsAPI";
import { getUserEnrolledCourses } from "../services/operations/profileAPI";
import { addToCart } from "../services/slices/cartSlice";
import PaginationControls from "../components/Common/PaginationControls";
import {
  VscSearch,
  VscListFilter,
  VscBook,
  VscStarFull,
  VscArrowRight,
  VscChevronDown
} from "react-icons/vsc";

const Catalog = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categoryId: pathCategoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategoryParam = searchParams.get("category") || "";

  const { token } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  const [courses, setCourses] = useState([]);
  const [totalCoursesCount, setTotalCoursesCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState(pathCategoryId || queryCategoryParam || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial categories & enrolled courses
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const catRes = await fetchCourseCategories();
        if (isMounted && Array.isArray(catRes)) {
          setCategories(catRes);
        }

        if (token) {
          const enrolled = await getUserEnrolledCourses(token);
          if (isMounted && enrolled && Array.isArray(enrolled)) {
            const eIds = new Set(enrolled.map((c) => String(c._id || c.id)));
            setEnrolledCourseIds(eIds);
          }
        }
      } catch (error) {
        console.error("Error fetching catalog initial data", error);
      }
    };

    fetchInitialData();
    return () => { isMounted = false; };
  }, [token]);

  // Sync category & search params from URL
  useEffect(() => {
    const activeCategory = pathCategoryId || queryCategoryParam || "all";
    setSelectedCategory(activeCategory);
    const querySearch = searchParams.get("search");
    if (querySearch !== null) {
      setSearchQuery(querySearch);
    }
  }, [pathCategoryId, queryCategoryParam, searchParams]);

  // Fetch Courses with server-side pagination, search, category, sortBy
  useEffect(() => {
    let isMounted = true;
    const fetchCoursesData = async () => {
      setLoading(true);
      try {
        const res = await getAllCourses(
          currentPage,
          coursesPerPage,
          selectedCategory,
          searchQuery,
          sortBy
        );
        if (isMounted && res) {
          setCourses(res.data || []);
          setTotalCoursesCount(res.totalCourses || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching courses catalog", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCoursesData();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentPage, selectedCategory, searchQuery, sortBy]);

  // Handle Category selection
  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    if (catId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: catId });
    }
  };

  const renderAccessButton = (course) => {
    const courseId = String(course._id || course.id);
    const isEnrolled = enrolledCourseIds.has(courseId);
    const isInCart = cart.some((item) => String(item._id || item.id) === courseId);

    if (isEnrolled) {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/courses/${courseId}`);
            }}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all border border-gray-200"
          >
            Preview
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/view-course/${courseId}`);
            }}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
          >
            <span>Go to Course</span>
            <VscArrowRight />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/courses/${courseId}`);
          }}
          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all border border-gray-200"
        >
          Preview
        </button>

        {isInCart ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/cart");
            }}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
          >
            <span>Go to Cart</span>
            <VscArrowRight />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(addToCart(course));
            }}
            className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
          >
            <span>Add to Cart</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans flex flex-col justify-between">
      
      <div className="max-w-[1260px] mx-auto py-12 px-4 sm:px-6 w-full space-y-10">
        
        {/* 1. PAGE HEADER */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Explore Our <span className="text-[#4F8FF7]">Course Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
            Discover thousands of courses designed to help you advance your career in tech.
          </p>
        </div>

        {/* 2. SEARCH & CATEGORY SELECTOR DROPDOWN */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
          <div className="relative w-full sm:flex-1 group">
            <VscSearch className="absolute left-4 top-3.5 text-gray-400 text-sm group-focus-within:text-[#3B82F6] transition-colors" />
            <input
              type="text"
              placeholder="Search for courses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            />
          </div>

          <div className="relative w-full sm:w-56" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3 text-sm text-gray-800 outline-none cursor-pointer focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm font-medium"
            >
              <span className="truncate pr-2">
                {selectedCategory === "all" ? "All Categories" : categories.find(c => String(c._id || c.id) === String(selectedCategory))?.name || "All Categories"}
              </span>
              <VscChevronDown className={`text-gray-400 text-lg transition-transform duration-200 shrink-0 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-premium-light border border-gray-200 text-gray-700 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5">
                  <div 
                    onClick={() => { handleCategorySelect("all"); setIsCategoryDropdownOpen(false); }}
                    className={`px-4 py-2.5 text-sm cursor-pointer rounded-xl transition-colors ${selectedCategory === "all" ? "bg-[#DBEAFE] text-[#3B82F6] font-bold" : "hover:bg-[#EFF6FF] hover:text-[#3B82F6] text-gray-600"}`}
                  >
                    All Categories
                  </div>
                  {categories.map((cat) => {
                    const catId = cat._id || cat.id;
                    const isSelected = String(selectedCategory) === String(catId);
                    return (
                      <div
                        key={catId}
                        onClick={() => { handleCategorySelect(catId); setIsCategoryDropdownOpen(false); }}
                        className={`px-4 py-2.5 text-sm cursor-pointer rounded-xl transition-colors ${isSelected ? "bg-[#DBEAFE] text-[#3B82F6] font-bold" : "hover:bg-[#EFF6FF] hover:text-[#3B82F6] text-gray-600"}`}
                      >
                        {cat.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. COURSE GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-4 animate-pulse">
                <div className="h-44 w-full bg-gray-200 rounded-2xl" />
                <div className="h-5 bg-gray-200 rounded-md w-3/4" />
                <div className="h-4 bg-gray-200 rounded-md w-full" />
                <div className="h-12 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {courses.map((course) => {
              const courseId = course._id || course.id;
              const origPrice = Number(course?.pricing?.originalPrice || course?.originalPrice || course?.price || 0);
              const currentPrice = Number(course?.pricing?.finalPrice || course?.price || 0);
              const discountPct = origPrice > currentPrice ? Math.round(((origPrice - currentPrice) / origPrice) * 100) : 0;
              const rating = course.averageRating || 4.5;
              const categoryName = course.category?.name || "Development";
              const totalSections = course.courseContent?.length || course.sections?.length || 2;

              return (
                <div
                  key={courseId}
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="bg-white border border-gray-100 hover:border-blue-200 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Course Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                      <img
                        src={course.thumbnail}
                        alt={course.courseName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase bg-white/90 backdrop-blur-md text-gray-800 border border-white/50 px-2.5 py-1 rounded-lg shadow-sm">
                        {categoryName}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-extrabold text-lg text-gray-900 line-clamp-1 group-hover:text-[#3B82F6] transition-colors">
                        {course.courseName}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {course.courseDescription}
                      </p>

                      {/* Course Metadata */}
                      <div className="flex items-center gap-4 text-[11px] font-medium text-gray-500 pt-1">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <VscBook className="text-[#3B82F6]" />
                          <span>{totalSections} Sections</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <span className="text-orange-500">🔥</span> 
                          <span>{course.studentsEnroled?.length || 8569} Enrolled</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom / Access Button */}
                  <div className="p-5 pt-0 space-y-4">
                    {/* Pricing */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                      <div className="flex items-center gap-1.5">
                        <VscStarFull className="text-amber-400 text-sm" />
                        <span className="text-gray-900 font-bold text-sm">{rating}</span>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        {discountPct > 0 && (
                          <span className="text-xs font-semibold text-gray-400 line-through">₹{origPrice.toLocaleString()}</span>
                        )}
                        <span className="text-xl font-black text-gray-900">
                          ₹{currentPrice.toLocaleString()}
                        </span>
                        {discountPct > 0 && (
                          <span className="text-[10px] font-extrabold bg-[#DBEAFE] text-blue-700 px-1.5 py-0.5 rounded-md">
                            {discountPct}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    {renderAccessButton(course)}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="text-5xl">🔍</div>
            <h3 className="text-xl font-bold text-gray-900">No Courses Found</h3>
            <p className="text-sm text-gray-500">
              We couldn't find any courses matching your current search or category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchParams({});
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="px-6 py-2.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-md inline-block"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* 4. PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCoursesCount}
            onPageChange={(p) => setCurrentPage(p)}
          />
        )}

      </div>

    </div>
  );
};

export default Catalog;
