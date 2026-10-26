import React from "react";
import ContactUsForm from "./ContactUsForm";

const ContactForm = () => {
  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 md:p-9 shadow-xs text-left">
      {/* Header & Subtitle */}
      <div className="flex flex-col gap-1.5 mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Got an idea? <span className="text-[#3BA7F2]">Let's Build It Together</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 font-normal">
          Tell us more about your query. We'll get back to you as soon as possible.
        </p>
      </div>

      {/* Form Container */}
      <div>
        <ContactUsForm />
      </div>
    </div>
  );
};

export default ContactForm;