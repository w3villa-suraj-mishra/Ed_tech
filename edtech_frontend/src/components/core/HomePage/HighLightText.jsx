import React from 'react';

const HighLightText = ({ text }) => {
  return (
    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
      {" "}{text}
    </span>
  );
};

export default HighLightText;
