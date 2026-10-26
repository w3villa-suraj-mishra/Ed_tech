import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CTAButton from "./Button";
import { FiCopy, FiCheck, FiTerminal } from 'react-icons/fi';

const FaArrowRight = () => <span>→</span>;

const CodeBlocks = ({
  position,
  heading,
  subheading,
  ctabtn1,
  ctabtn2,
  codeblock,
  codeColor,
  filename = "Component.jsx"
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeblock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = codeblock.split('\n');

  return (
    <div className={`flex ${position} my-12 lg:my-20 justify-between items-center flex-col lg:gap-14 gap-10`}>
      
      {/* Left / Text Side */}
      <div className="w-full lg:w-[48%] flex flex-col gap-6 text-left">
        <div className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
          {heading}
        </div>
        
        <p className="text-base text-gray-600 font-normal leading-relaxed max-w-xl">
          {subheading}
        </p>

        {/* Feature Checkpoints for Richness */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs font-medium text-gray-700">
            <span className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[9px] sm:text-xs font-bold">✓</span>
            <span className="leading-tight">Real-time Code Execution</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs font-medium text-gray-700">
            <span className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[9px] sm:text-xs font-bold">✓</span>
            <span className="leading-tight">Automated Test Feedback</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs font-medium text-gray-700">
            <span className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[9px] sm:text-xs font-bold">✓</span>
            <span className="leading-tight">Industry Best Practices</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs font-medium text-gray-700">
            <span className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[9px] sm:text-xs font-bold">✓</span>
            <span className="leading-tight">Zero Local Setup</span>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-4 mt-4 w-full">
          <Link to={ctabtn1.linkto} className="flex-1 sm:flex-none">
            <div className={`text-center text-[11px] sm:text-sm px-2 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${
              ctabtn1.active
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
                : "bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 hover:border-gray-300 shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
            }`}>
              <span className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                {ctabtn1.btnText}
                <FaArrowRight />
              </span>
            </div>
          </Link>

          {ctabtn2 && (
            <Link to={ctabtn2.linkto} className="flex-1 sm:flex-none">
              <div className={`text-center text-[11px] sm:text-sm px-2 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${
                ctabtn2.active
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  : "bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 hover:border-gray-300 shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
              }`}>
                <span className="whitespace-nowrap">{ctabtn2.btnText}</span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Right / Modern Glass Code Window */}
      <div className="w-full lg:w-[50%] max-w-xl">
        <div className="rounded-3xl glass-card border border-white/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden text-xs sm:text-sm bg-white/60 backdrop-blur-xl">
          
          {/* Window Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-white/40 border-b border-gray-200/60 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block shadow-sm"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block shadow-sm"></span>
              <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block shadow-sm"></span>
              <div className="ml-3 flex items-center gap-1.5 text-gray-600 text-xs font-semibold font-mono">
                <FiTerminal className="text-[#3BA7F2] text-xs" />
                <span>playground.tsx</span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-gray-900 hover:bg-white/80 px-2.5 py-1.5 rounded-lg bg-white/50 border border-gray-200/60 transition-all shadow-sm backdrop-blur-xs font-medium"
              title="Copy snippet"
            >
              {copied ? (
                <>
                  <FiCheck className="text-emerald-600 text-xs" />
                  <span className="text-emerald-600 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <FiCopy className="text-xs" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Code Window Body with Line Numbers */}
          <div className="p-4 sm:p-5 flex font-mono leading-relaxed overflow-x-auto custom-scrollbar bg-white/20">
            {/* Line Indexing */}
            <div className="select-none text-gray-400/80 pr-4 text-right w-8 shrink-0 font-medium border-r border-gray-200/50 mr-4">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Content */}
            <div className="text-gray-700 flex-1 whitespace-pre overflow-x-auto font-medium">
              {lines.map((line, idx) => (
                <div key={idx} className="hover:bg-white/40 px-1.5 -ml-1.5 rounded transition-colors">
                  {line.includes('import') || line.includes('export') || line.includes('const') || line.includes('return') ? (
                    <span className="text-indigo-600 font-semibold">{line}</span>
                  ) : line.includes('<') || line.includes('>') ? (
                    <span className="text-blue-600">{line}</span>
                  ) : line.includes('http') || line.includes('"') || line.includes("'") ? (
                    <span className="text-emerald-600">{line}</span>
                  ) : (
                    <span className="text-gray-800">{line}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Footer Indicator */}
          <div className="px-5 py-2.5 bg-white/40 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500 backdrop-blur-md font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span>TypeScript Ready • React 19</span>
            </span>
            <span className="font-mono text-gray-400">UTF-8</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CodeBlocks;
