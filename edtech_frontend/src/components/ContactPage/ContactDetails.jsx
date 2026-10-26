import React from "react";
import { FiMessageSquare, FiMapPin, FiPhone, FiClock, FiArrowRight } from "react-icons/fi";

const waysToReach = [
  {
    icon: <FiMessageSquare />,
    title: "Chat with us",
    desc: "Our friendly team is here to help.",
    value: "support@codelearn.com",
    isLink: true,
    href: "mailto:support@codelearn.com",
  },
  {
    icon: <FiMapPin />,
    title: "Visit our office",
    desc: "Come say hi at our office HQ.",
    value: "Sector 63, Block A, Noida, Uttar Pradesh 201301",
    isLink: false,
  },
  {
    icon: <FiPhone />,
    title: "Call us",
    desc: "Mon - Fri from 9am to 6pm",
    value: "+91 12345 67890",
    isLink: true,
    href: "tel:+911234567890",
  },
  {
    icon: <FiClock />,
    title: "Response Time",
    desc: "We usually reply within",
    value: "24 hours",
    isLink: false,
  },
];

const ContactDetails = () => {
  return (
    <div className="flex flex-col gap-3 text-left font-sans">
      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
        OTHER WAYS TO REACH US
      </h3>

      <div className="grid grid-cols-1 gap-3.5">
        {waysToReach.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200/90 hover:border-indigo-300 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all duration-200 group shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#13AA92]/10 flex items-center justify-center text-[#3BA7F2] text-lg shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-gray-900 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 font-normal">
                  {item.desc}
                </p>
                {item.isLink ? (
                  <a
                    href={item.href}
                    className="text-xs font-semibold text-[#3BA7F2] block hover:underline"
                  >
                    {item.value}
                  </a>
                ) : (
                  <div className="text-xs font-semibold text-[#3BA7F2] leading-snug">
                    {item.value}
                  </div>
                )}
              </div>
            </div>

            <span className="text-gray-300 group-hover:text-[#3BA7F2] group-hover:translate-x-0.5 transition-all text-sm shrink-0">
              <FiArrowRight />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactDetails;