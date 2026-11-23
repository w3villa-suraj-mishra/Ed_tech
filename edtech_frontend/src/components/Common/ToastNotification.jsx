import React from "react";
import { Toaster, ToastBar, resolveValue, toast } from "react-hot-toast";

const getToastConfig = (type) => {
  switch (type) {
    case "error":
      return {
        barColor: "#E74C3C",
        trackColor: "rgba(231, 76, 60, 0.2)",
        icon: (
          <svg
            className="w-[22px] h-[22px] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" fill="#E74C3C" />
            <rect x="11" y="6.8" width="2" height="6.4" rx="1" fill="#FFFFFF" />
            <circle cx="12" cy="16" r="1.25" fill="#FFFFFF" />
          </svg>
        ),
      };
    case "success":
      return {
        barColor: "#07BC0C",
        trackColor: "rgba(7, 188, 12, 0.2)",
        icon: (
          <svg
            className="w-[22px] h-[22px] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" fill="#07BC0C" />
            <path
              d="M7.5 12.5L10.5 15.5L16.5 9.5"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      };
    case "loading":
      return {
        barColor: "#3498DB",
        trackColor: "rgba(52, 152, 219, 0.2)",
        icon: (
          <svg
            className="w-[22px] h-[22px] shrink-0 animate-spin text-[#3498DB]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="#E5E7EB"
              strokeWidth="2.5"
            />
            <path
              d="M12 3a9 9 0 0 1 9 9"
              stroke="#3498DB"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        ),
      };
    case "warning":
      return {
        barColor: "#F59E0B",
        trackColor: "rgba(245, 158, 11, 0.2)",
        icon: (
          <svg
            className="w-[22px] h-[22px] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" fill="#F59E0B" />
            <rect x="11" y="6.8" width="2" height="6.4" rx="1" fill="#FFFFFF" />
            <circle cx="12" cy="16" r="1.25" fill="#FFFFFF" />
          </svg>
        ),
      };
    case "blank":
    case "custom":
    default:
      return {
        barColor: "#3498DB",
        trackColor: "rgba(52, 152, 219, 0.2)",
        icon: (
          <svg
            className="w-[22px] h-[22px] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" fill="#3498DB" />
            <circle cx="12" cy="8" r="1.25" fill="#FFFFFF" />
            <rect x="11" y="10.8" width="2" height="5.4" rx="1" fill="#FFFFFF" />
          </svg>
        ),
      };
  }
};

export const ToastCard = ({ toast: t }) => {
  const config = getToastConfig(t.type);
  const duration = t.duration || 4000;
  const isFiniteDuration =
    t.type !== "loading" && duration > 0 && duration !== Infinity;

  return (
    <div
      className="toast-card group relative flex items-center gap-3 bg-white text-[#555555] rounded-[6px] pl-3.5 pr-2.5 pt-3 pb-3.5 min-w-[280px] max-w-[420px] shadow-[0_4px_12px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)] border border-black/[0.04] overflow-hidden select-none"
    >
      {/* Icon */}
      <div className="shrink-0 flex items-center justify-center">
        {t.icon ? t.icon : config.icon}
      </div>

      {/* Message */}
      <div className="flex-1 text-[14px] leading-snug font-normal text-[#555555] break-words pr-2">
        {resolveValue(t.message, t)}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toast.dismiss(t.id);
        }}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer shrink-0 self-start -mt-1 -mr-1"
        aria-label="Close notification"
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Progress Bar */}
      {isFiniteDuration && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[4px] overflow-hidden"
          style={{ backgroundColor: config.trackColor }}
        >
          <div
            className="toast-progress-bar h-full w-full"
            style={{
              backgroundColor: config.barColor,
              animationDuration: `${duration}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export const CustomToaster = () => {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 4000,
      }}
    >
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            padding: 0,
            margin: 0,
            background: "transparent",
            boxShadow: "none",
            border: "none",
            maxWidth: "none",
          }}
        >
          {() => <ToastCard toast={t} />}
        </ToastBar>
      )}
    </Toaster>
  );
};

export { toast, Toaster };
export default CustomToaster;
