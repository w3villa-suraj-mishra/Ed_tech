import React from 'react';
import { FiUser, FiPhone } from 'react-icons/fi';

const CustomerDetailsForm = ({ customerDetails, errors, onChange, disabled }) => {
  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-6 space-y-5 shadow-2xs">
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
          Customer Information
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 font-normal">
          Enter your contact information for order confirmation & tax receipt
        </p>
      </div>

      <div className="space-y-4">
        {/* NAME INPUT */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="e.g. Suraj Mishra"
              value={customerDetails?.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              disabled={disabled}
              className={`w-full bg-gray-50 border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition ${
                errors?.name
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-gray-200 focus:border-[#3BA7F2]'
              }`}
            />
          </div>
          {errors?.name && (
            <p className="text-xs text-rose-500 font-medium pt-0.5">⚠️ {errors.name}</p>
          )}
        </div>

        {/* MOBILE NUMBER INPUT */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Mobile Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="tel"
              placeholder="e.g. +91 9876543210"
              value={customerDetails?.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              disabled={disabled}
              className={`w-full bg-gray-50 border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition ${
                errors?.phone
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-gray-200 focus:border-[#3BA7F2]'
              }`}
            />
          </div>
          {errors?.phone && (
            <p className="text-xs text-rose-500 font-medium pt-0.5">⚠️ {errors.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsForm;
