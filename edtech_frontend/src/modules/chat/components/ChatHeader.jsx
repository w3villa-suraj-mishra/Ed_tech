import React, { useState } from 'react';
import { FiX, FiMaximize2, FiMinimize2, FiMinus, FiMoreVertical, FiTrash2, FiBookOpen } from 'react-icons/fi';
import { STATUS_COLORS } from '../constants/chatConstants';
import { formatLastSeen } from '../utils/chatFormatters';

export default function ChatHeader({
  title = 'Student Support',
  subtitle = null,
  isOnline = false,
  lastSeen = null,
  course = null,
  pageContext = null,
  status = 'OPEN',
  onClose,
  onMinimize,
  onToggleExpand,
  isExpanded = false,
  onArchive,
  isAdminView = false,
  extraActions = null
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.OPEN;

  return (
    <div className="bg-purple-700 text-white px-3.5 py-2.5 rounded-t-xl flex items-center justify-between shadow-xs select-none gap-2">
      {/* Participant info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs text-white">
            {title?.[0]?.toUpperCase() || 'S'}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-purple-700 ${
              isOnline ? 'bg-emerald-400' : 'bg-gray-400'
            }`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-bold text-sm leading-tight text-white truncate" title={title}>
              {title}
            </h3>
            {status && (
              <span
                className={`shrink-0 text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded border leading-none ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                {status}
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-purple-200 truncate leading-tight mt-0.5">
            {subtitle || formatLastSeen(lastSeen, isOnline)}
          </p>
        </div>
      </div>

      {/* Header Context & Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Context badge if viewing a specific course */}
        {course && (
          <div
            className="hidden sm:flex items-center gap-1 bg-purple-800/80 border border-purple-500/40 rounded px-2 py-0.5 text-[10px] text-purple-200"
            title={`Context: ${course.courseName}`}
          >
            <FiBookOpen size={11} />
            <span className="truncate max-w-[120px]">{course.courseName}</span>
          </div>
        )}

        {extraActions}

        {/* More Options Dropdown */}
        {onArchive && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
              title="Options"
            >
              <FiMoreVertical size={16} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 text-gray-800 text-xs">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onArchive();
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    <FiTrash2 size={13} />
                    <span>Clear & Archive</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Expand / Restore size */}
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            title={isExpanded ? 'Collapse chat view' : 'Expand chat view'}
          >
            {isExpanded ? <FiMinimize2 size={15} /> : <FiMaximize2 size={15} />}
          </button>
        )}

        {/* Minimize to button */}
        {onMinimize && (
          <button
            onClick={onMinimize}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            title="Minimize"
          >
            <FiMinus size={15} />
          </button>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            title="Close"
          >
            <FiX size={17} />
          </button>
        )}
      </div>
    </div>
  );
}
