import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VscCheck, VscClose, VscWarning } from 'react-icons/vsc';

const PaymentStatusModal = ({ modalData, onClose, onRetry }) => {
  const navigate = useNavigate();

  if (!modalData || !modalData.isOpen) return null;

  const { status, message } = modalData;

  const handleStartLearning = () => {
    onClose();
    navigate('/dashboard/enrolled-courses');
  };

  const handleGoDashboard = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200 font-sans">
        
        {/* ICON BY STATUS */}
        {status === 'success' && (
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <VscCheck className="text-3xl" />
          </div>
        )}

        {status === 'failed' && (
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <VscClose className="text-3xl" />
          </div>
        )}

        {status === 'cancelled' && (
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <VscWarning className="text-3xl" />
          </div>
        )}

        {/* TITLE & DESCRIPTION */}
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-[#0F172A]">
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'cancelled' && 'Payment Cancelled'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
            {message || (
              status === 'success'
                ? 'Your course access has been activated. You can now start learning right away.'
                : status === 'failed'
                ? 'Your payment could not be completed. Please try again.'
                : 'Payment process was cancelled.'
            )}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-3 pt-2">
          {status === 'success' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartLearning}
                className="flex-1 py-3 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white font-bold text-xs transition shadow-xs cursor-pointer"
              >
                Start Learning
              </button>
              <button
                onClick={handleGoDashboard}
                className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs border border-gray-200 transition cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {(status === 'failed' || status === 'cancelled') && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onClose();
                  if (onRetry) onRetry();
                }}
                className="flex-1 py-3 rounded-xl bg-[#3BA7F2] hover:bg-[#2895E0] text-white font-bold text-xs transition shadow-xs cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate('/cart');
                }}
                className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs border border-gray-200 transition cursor-pointer"
              >
                Back to Cart
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PaymentStatusModal;
