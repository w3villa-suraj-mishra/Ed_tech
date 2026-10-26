import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ children, active, linkto }) => {
  return (
    <Link to={linkto} className="inline-block">
      <div
        className={`text-center text-sm px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
          active
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
            : "bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 hover:border-gray-300 shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
        }`}
      >
        {children}
      </div>
    </Link>
  );
};

export default Button;
