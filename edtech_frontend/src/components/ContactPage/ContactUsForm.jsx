import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiConnector } from '../../services/apiConnector';
import { contactusEndpoint } from '../../services/apis';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiSend, FiChevronDown } from 'react-icons/fi';

const ContactUsForm = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful }
  } = useForm();

  const submitContactForm = async (data) => {
    try {
      setLoading(true);
      const res = await apiConnector(
        "POST",
        contactusEndpoint.CONTACT_US_API,
        data
      );

      if (res?.data?.success) {
        toast.success("Message sent successfully 🎉");
      } else {
        toast.error(res?.data?.message || "Failed to send message ❌");
      }
      setLoading(false);
    } catch (error) {
      console.log("ERROR MESSAGE - ", error);
      const errMsg = error.response?.data?.message || error.message || "Something went wrong ❌";
      toast.error(errMsg);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        email: "",
        firstname: "",
        lastname: "",
        subject: "",
        message: "",
      });
    }
  }, [reset, isSubmitSuccessful]);

  return (
    <form
      className="flex flex-col gap-4 text-left font-sans"
      onSubmit={handleSubmit(submitContactForm)}
    >
      {/* First + Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label htmlFor="firstname" className="text-xs font-semibold text-gray-700 mb-1.5">
            First Name
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-gray-400 text-sm pointer-events-none">
              <FiUser />
            </span>
            <input
              type="text"
              id="firstname"
              placeholder="Enter first name"
              className="w-full rounded-xl bg-white border border-gray-200 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2] focus:ring-1 focus:ring-[#3BA7F2] transition-all"
              {...register("firstname", { required: true })}
            />
          </div>
          {errors.firstname && (
            <span className="text-[11px] text-red-500 mt-1">
              Please enter your first name
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="lastname" className="text-xs font-semibold text-gray-700 mb-1.5">
            Last Name
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-gray-400 text-sm pointer-events-none">
              <FiUser />
            </span>
            <input
              type="text"
              id="lastname"
              placeholder="Enter last name"
              className="w-full rounded-xl bg-white border border-gray-200 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2] focus:ring-1 focus:ring-[#3BA7F2] transition-all"
              {...register("lastname")}
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col">
        <label htmlFor="email" className="text-xs font-semibold text-gray-700 mb-1.5">
          Email Address
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-gray-400 text-sm pointer-events-none">
            <FiMail />
          </span>
          <input
            type="email"
            id="email"
            placeholder="Enter your email address"
            className="w-full rounded-xl bg-white border border-gray-200 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2] focus:ring-1 focus:ring-[#3BA7F2] transition-all"
            {...register("email", { required: true })}
          />
        </div>
        {errors.email && (
          <span className="text-[11px] text-red-500 mt-1">
            Please enter your email address
          </span>
        )}
      </div>

      {/* Subject */}
      <div className="flex flex-col">
        <label htmlFor="subject" className="text-xs font-semibold text-gray-700 mb-1.5">
          Subject
        </label>
        <div className="relative flex items-center">
          <select
            id="subject"
            defaultValue=""
            className="w-full rounded-xl bg-white border border-gray-200 px-3.5 py-2.5 pr-9 text-xs sm:text-sm text-gray-700 focus:outline-none focus:border-[#3BA7F2] focus:ring-1 focus:ring-[#3BA7F2] transition-all appearance-none cursor-pointer"
            {...register("subject")}
          >
            <option value="" disabled>Select a subject</option>
            <option value="Course Inquiry & Enrollment">Course Inquiry & Enrollment</option>
            <option value="Technical Issue & Support">Technical Issue & Support</option>
            <option value="Billing & Payment">Billing & Payment</option>
            <option value="Partnership & Business">Partnership & Business</option>
            <option value="General Queries">General Queries</option>
          </select>
          <span className="absolute right-3 text-gray-400 text-sm pointer-events-none">
            <FiChevronDown />
          </span>
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col">
        <label htmlFor="message" className="text-xs font-semibold text-gray-700 mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          rows="4"
          placeholder="Type your message here..."
          className="w-full rounded-xl bg-white border border-gray-200 p-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2] focus:ring-1 focus:ring-[#3BA7F2] transition-all resize-none min-h-[110px]"
          {...register("message", { required: true })}
        />
        {errors.message && (
          <span className="text-[11px] text-red-500 mt-1">
            Please enter your message
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button
        disabled={loading}
        type="submit"
        className={`mt-2 w-full rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] py-3 text-xs sm:text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center gap-2 ${
          loading ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <FiSend className="text-xs rotate-45" />
        <span>{loading ? "Sending..." : "Send Message"}</span>
      </button>
    </form>
  );
};

export default ContactUsForm;