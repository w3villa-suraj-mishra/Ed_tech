import React from "react"

export default function ConfirmationModal({ modalData }) {
  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200/90 bg-white p-6 shadow-2xl space-y-4 font-sans animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-[#0F172A] leading-snug">
          {modalData?.text1}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
          {modalData?.text2}
        </p>
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
            onClick={modalData?.btn2Handler}
          >
            {modalData?.btn2Text || "Cancel"}
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            onClick={modalData?.btn1Handler}
          >
            {modalData?.btn1Text || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  )
}

