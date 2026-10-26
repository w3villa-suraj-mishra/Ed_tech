import React from 'react';

const OrderSummary = ({ courses }) => {
  if (!courses || courses.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-6 space-y-4 shadow-2xs">
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">Course Summary</h3>
        <p className="text-xs text-gray-500 mt-0.5 font-normal">
          {courses.length} {courses.length === 1 ? 'course' : 'courses'} in this order
        </p>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        {courses.map((course) => {
          const courseId = course._id || course.id;
          const origPrice = Number(course?.pricing?.originalPrice || course?.originalPrice || course?.price || 0);
          const currentPrice = Number(course?.pricing?.finalPrice || course?.price || 0);

          return (
            <div
              key={courseId}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/80"
            >
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.courseName}
                  className="w-16 h-12 rounded-lg object-cover bg-gray-200 shrink-0 border border-gray-200"
                />
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] line-clamp-1">
                  {course.courseName || course.title}
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-1 font-normal">
                  {course.courseDescription || course.description}
                </p>
                <span className="inline-block text-[10px] text-[#3BA7F2] font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                  {course.accessDuration || 'Full Lifetime Access'}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-black text-[#0F172A] block">
                  ₹{currentPrice.toLocaleString()}
                </span>
                {origPrice > currentPrice && (
                  <span className="text-[10px] text-gray-400 line-through">
                    ₹{origPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderSummary;
