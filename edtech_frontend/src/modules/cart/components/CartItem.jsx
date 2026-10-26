import React from 'react';
import { VscTrash } from 'react-icons/vsc';

const CartItem = ({ course, onRemove }) => {
  if (!course) return null;

  const courseId = course._id || course.id;
  const originalPrice = Number(course?.pricing?.originalPrice || course?.originalPrice || course?.price || 0);
  const currentPrice = Number(course?.pricing?.finalPrice || course?.price || 0);
  const discountPct = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const accessDuration = course.accessDuration || 'Lifetime access';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200/90 hover:border-[#3BA7F2]/40 transition-all shadow-2xs group">
      
      {/* LEFT: THUMBNAIL & INFO */}
      <div className="flex items-center gap-4 min-w-0 flex-1 w-full sm:w-auto">
        <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
          <img
            src={course.thumbnail || course.image}
            alt={course.courseName || course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <h4 className="font-bold text-sm text-[#0F172A] line-clamp-1 group-hover:text-[#3BA7F2] transition-colors">
            {course.courseName || course.title}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-1 font-normal">
            {course.courseDescription || course.description}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className="bg-sky-50 text-[#3BA7F2] px-2 py-0.5 rounded font-semibold border border-sky-100">
              {accessDuration}
            </span>
            <span>•</span>
            <span>{course.sections?.length || course.courseContent?.length || 0} Sections</span>
          </div>
        </div>
      </div>

      {/* RIGHT: PRICE & REMOVE BUTTON */}
      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        <div className="text-left sm:text-right">
          <div className="flex items-center gap-2">
            {discountPct > 0 && (
              <span className="text-xs text-gray-400 line-through font-medium">
                ₹{originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-lg font-black text-[#0F172A]">
              ₹{currentPrice.toLocaleString()}
            </span>
          </div>
          {discountPct > 0 && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {discountPct}% OFF
            </span>
          )}
        </div>

        <button
          onClick={() => onRemove(courseId)}
          className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors focus:outline-none cursor-pointer"
          title="Remove from cart"
          aria-label="Remove item"
        >
          <VscTrash className="text-lg" />
        </button>
      </div>

    </div>
  );
};

export default CartItem;
