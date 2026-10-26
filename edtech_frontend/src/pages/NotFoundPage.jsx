import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCompass, FiBookOpen } from 'react-icons/fi';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#F8FAFC] px-4 py-16 font-sans">
      <div className="max-w-lg w-full bg-white border border-gray-200/90 rounded-3xl p-8 sm:p-10 shadow-xs text-center space-y-6">
        
        {/* Graphic */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3BA7F2] text-3xl shadow-2xs">
          <FiCompass />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#3BA7F2] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Page Not Found • 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Lost Your Way?
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed max-w-sm mx-auto">
            The page or practice module you are looking for doesn't exist or has moved to a new URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/practice')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#3BA7F2] hover:bg-[#13AA92] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-xs"
          >
            <FiBookOpen className="text-xs" />
            <span>Practice Center</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold px-5 py-2.5 rounded-full transition-all"
          >
            <FiArrowLeft className="text-xs" />
            <span>Back to Home</span>
          </button>
        </div>

      </div>
    </div>
  );
}
